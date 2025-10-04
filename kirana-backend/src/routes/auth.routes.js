import { Router } from "express";
import { signupSeller, login } from "../controllers/auth.controller.js";
const router = Router();

router.post("/seller/signup", signupSeller);
router.post("/login", login);

export default router;