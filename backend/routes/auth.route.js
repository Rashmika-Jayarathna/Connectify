import express from 'express';
import { signup } from '../controllers/auth.controller.js';
import { login } from '../controllers/auth.controller.js';
import { logout } from '../controllers/auth.controller.js';

const  router = express.Router(); 

router.get("/signup", signup); 

router.get("/login", login); 

router.get("/logout", logout); 

export default router;