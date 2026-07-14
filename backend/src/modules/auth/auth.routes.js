import { Router } from "express";

import {
  register,
  login
} from "./auth.controller.js";


import {
  refreshAccessToken,
  logout
} from "./refreshToken.controller.js";


import {
  registerValidator
} from "./auth.validator.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import authorizeRoles 
from "../../middleware/role.middleware.js";

const router = Router();


/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Madhu
 *
 *               lastName:
 *                 type: string
 *                 example: TV
 *
 *               email:
 *                 type: string
 *                 example: madhu@test.com
 *
 *               password:
 *                 type: string
 *                 example: Password@123
 *
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: cm123456
 *
 *                     firstName:
 *                       type: string
 *                       example: Madhu
 *
 *                     lastName:
 *                       type: string
 *                       example: TV
 *
 *                     email:
 *                       type: string
 *                       example: madhu@test.com
 *
 *       400:
 *         description: Validation error
 */
router.post(
  "/register",
  registerValidator,
  register
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Authentication
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: madhu@test.com
 *
 *               password:
 *                 type: string
 *                 example: Password@123
 *
 *     responses:
 *       200:
 *         description: Login successful
 *
 *       401:
 *         description: Invalid email or password
 */

router.post(
  "/login",
  login
);


router.post(
  "/refresh-token",
  refreshAccessToken
);


router.post(
  "/logout",
  logout
);

router.get(
  "/profile",
  authMiddleware,
  (req,res)=>{

    res.status(200).json({
      success:true,
      message:"Protected route accessed",
      user:req.user
    });

  }
);

router.get(
  "/admin-test",
  authMiddleware,
  authorizeRoles("ADMIN"),
  (req,res)=>{

    res.status(200).json({

      success:true,

      message:"Admin access granted",

      user:req.user

    });

  }
);

export default router;