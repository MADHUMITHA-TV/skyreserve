import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
  create,
  findAll,
  findOne,
  update,
  remove
} from "./airline.controller.js";

import {
  airlineValidator
} from "./airline.validator.js";


const router = Router();



/**
 * @swagger
 * tags:
 *   name: Airline
 *   description: Airline management APIs
 */





/**
 * @swagger
 * /api/v1/airlines:
 *   post:
 *     summary: Create a new airline
 *     tags: [Airline]
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
 *             required:
 *               - name
 *               - code
 *
 *             properties:
 *
 *               name:
 *                 type: string
 *                 example: Air India
 *
 *               code:
 *                 type: string
 *                 example: AI
 *
 *
 *     responses:
 *
 *       201:
 *         description: Airline created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  airlineValidator,
  create
);







/**
 * @swagger
 * /api/v1/airlines:
 *   get:
 *     summary: Get all airlines
 *     tags: [Airline]
 *
 *     responses:
 *
 *       200:
 *         description: Airlines fetched successfully
 *
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 data:
 *                   type: array
 *
 *                   items:
 *                     type: object
 *
 *                     properties:
 *
 *                       id:
 *                         type: string
 *                         example: cmairline123
 *
 *                       name:
 *                         type: string
 *                         example: Air India
 *
 *                       code:
 *                         type: string
 *                         example: AI
 */
router.get(
  "/",
  findAll
);







/**
 * @swagger
 * /api/v1/airlines/{id}:
 *   get:
 *     summary: Get airline by ID
 *     tags: [Airline]
 *
 *     parameters:
 *
 *       - in: path
 *         name: id
 *         required: true
 *
 *         schema:
 *           type: string
 *
 *         example: cmairline123
 *
 *
 *     responses:
 *
 *       200:
 *         description: Airline fetched successfully
 *
 *       404:
 *         description: Airline not found
 */
router.get(
  "/:id",
  findOne
);







/**
 * @swagger
 * /api/v1/airlines/{id}:
 *   put:
 *     summary: Update airline details
 *     tags: [Airline]
 *     security:
 *       - bearerAuth: []
 *
 *
 *     parameters:
 *
 *       - in: path
 *         name: id
 *         required: true
 *
 *         schema:
 *           type: string
 *
 *         example: cmairline123
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
 *             properties:
 *
 *               name:
 *                 type: string
 *                 example: Indigo Airlines
 *
 *               code:
 *                 type: string
 *                 example: 6E
 *
 *
 *     responses:
 *
 *       200:
 *         description: Airline updated successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Airline not found
 */
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  update
);








/**
 * @swagger
 * /api/v1/airlines/{id}:
 *   delete:
 *     summary: Delete airline
 *     tags: [Airline]
 *     security:
 *       - bearerAuth: []
 *
 *
 *     parameters:
 *
 *       - in: path
 *         name: id
 *         required: true
 *
 *         schema:
 *           type: string
 *
 *         example: cmairline123
 *
 *
 *     responses:
 *
 *       200:
 *         description: Airline deleted successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Airline not found
 */
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  remove
);



export default router;