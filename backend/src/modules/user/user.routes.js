import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";


import {
  profile,
  update
} from "./user.controller.js";


import {
  updateProfileValidator
} from "./user.validator.js";


const router = Router();



/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get logged-in user profile
 *     tags:
 *       - User
 *
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/profile",
  authMiddleware,
  profile
);





/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags:
 *       - User
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             properties:
 *
 *               firstName:
 *                 type: string
 *                 example: Madhu
 *
 *               lastName:
 *                 type: string
 *                 example: TV
 *
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *
 *
 *     responses:
 *
 *       200:
 *         description: Profile updated successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 */
router.put(
  "/profile",
  authMiddleware,
  updateProfileValidator,
  update
);



export default router;