import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./modules/auth/routes.js";
import sellerRoutes from "./modules/seller/routes.js";
import kycRoutes from "./modules/kyc/routes.js";
import inventoryRoutes from "./modules/inventory/routes.js";
import { generalLimiter } from "./middleware/rateLimit.js";

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:8081', 'exp://192.168.1.100:8081'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Debug endpoint to check database and tables
app.get("/debug/db", async (_req, res) => {
  try {
    const { query } = await import('./db/connection.js');

    // Check if products table exists
    const tables = await query("SHOW TABLES LIKE 'products'");
    const categories = await query("SHOW TABLES LIKE 'product_categories'");

    // Get some basic stats if tables exist
    let stats = {};
    if (tables.length > 0) {
      const productCount = await query("SELECT COUNT(*) as count FROM products");
      stats.products = productCount[0].count;
    }
    if (categories.length > 0) {
      const categoryCount = await query("SELECT COUNT(*) as count FROM product_categories");
      stats.categories = categoryCount[0].count;
    }

    res.json({
      ok: true,
      database: process.env.DB_NAME,
      tables: {
        products_exists: tables.length > 0,
        categories_exists: categories.length > 0
      },
      stats
    });
  } catch (error) {
    console.error('Database debug error:', error);
    res.status(500).json({
      ok: false,
      error: error.message,
      database: process.env.DB_NAME
    });
  }
});

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

app.use("/auth", authRoutes);
app.use("/kyc", kycRoutes);
app.use("/seller", sellerRoutes);
app.use("/products", inventoryRoutes);

// Serve uploaded files
app.use('/uploads', express.static('./uploads'));

// 404
app.use((_req, res) => res.status(404).json({ success: false, error: "Not found" }));

// error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Server error" });
});

export default app;
