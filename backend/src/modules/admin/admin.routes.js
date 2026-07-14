import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
  users,
  updateRole
} from "./admin.controller.js";


const router = Router();



/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management APIs
 */



/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     summary: Get all registered users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *
 *                       id:
 *                         type: string
 *                         example: cmuser123
 *
 *                       firstName:
 *                         type: string
 *                         example: Madhu
 *
 *                       lastName:
 *                         type: string
 *                         example: TV
 *
 *                       email:
 *                         type: string
 *                         example: madhu@test.com
 *
 *                       role:
 *                         type: string
 *                         example: CUSTOMER
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get(
  "/users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  users
);






/**
 * @swagger
 * /api/v1/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *
 *         schema:
 *           type: string
 *
 *         example: cmuser123
 *
 *
 *     requestBody:
 *       required: true
 *
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - role
 *
 *             properties:
 *               role:
 *                 type: string
 *                 example: ADMIN
 *
 *
 *     responses:
 *       200:
 *         description: User role updated successfully
 *
 *       400:
 *         description: Invalid role
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden - Admin access required
 *
 *       404:
 *         description: User not found
 */
router.patch(
  "/users/:id/role",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updateRole
);



export default router;