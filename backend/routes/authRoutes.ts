import express from 'express';
import { register, login, getProfile, updateProfile, deleteProfile } from '../controllers/authController';

import auth from '../middleware/auth';

const router = express.Router();        

router.post("/register", register);
router.post("/login", login);

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.delete("/profile", auth, deleteProfile);

export default router;