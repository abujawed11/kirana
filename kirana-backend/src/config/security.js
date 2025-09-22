export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || "dev_secret_change_me_in_production",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me_in_production",
    accessTokenExpiry: "30d", // Long-lived for mobile apps
    refreshTokenExpiry: "90d",
    algorithm: "HS256",
  },

  // Password Configuration
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Optional for better UX
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },

  // Rate Limiting Configuration
  rateLimit: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10,
    },
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
    },
    otp: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 3,
    },
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8081',
      'exp://192.168.1.100:8081'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // Security Headers Configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    crossOriginEmbedderPolicy: false, // Disable for mobile app compatibility
  },

  // Session Configuration
  session: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  },

  // OTP Configuration
  otp: {
    length: 6,
    ttlSeconds: 120, // 2 minutes
    maxAttempts: 5,
    resendCooldown: 60, // 1 minute
  },

  // File Upload Security
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    maxFiles: 10,
  },

  // Validation Rules
  validation: {
    email: {
      maxLength: 254,
      regex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
    },
    phone: {
      regex: /^[6-9]\d{9}$/, // Indian mobile numbers
      minLength: 10,
      maxLength: 10,
    },
    name: {
      minLength: 2,
      maxLength: 50,
      regex: /^[a-zA-Z\s]+$/,
    },
  },

  // Security Monitoring
  monitoring: {
    logSecurityEvents: process.env.NODE_ENV === 'production',
    alertOnSuspiciousActivity: true,
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
};

export default securityConfig;