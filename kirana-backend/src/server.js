import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";

const port = process.env.PORT || 5080;
app.listen(port, () => console.log(`🚀 API running on http://localhost:${port}`));
