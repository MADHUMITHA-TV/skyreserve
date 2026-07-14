import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
  create,
  findAll,
  findOne,
  update,
  remove
} from "./airport.controller.js";

import {
  airportValidator
} from "./airport.validator.js";


const router = Router();



/**
 * @swagger
 * tags:
 *   name: Airport
 *   description: Airport management APIs
 */





/**
 * @swagger
 * /api/v1/airports:
 *   post:
 *     summary: Create a new airport
 *     tags: [Airport]
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
 *               - city
 *               - country
 *
 *             properties:
 *
 *               name:
 *                 type: string
 *                 example: Chennai International Airport
 *
 *               code:
 *                 type: string
 *                 example: MAA
 *
 *               city:
 *                 type: string
 *                 example: Chennai
 *
 *               country:
 *                 type: string
 *                 example: India
 *
 *
 *     responses:
 *
 *       201:
 *         description: Airport created successfully
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
  airportValidator,
  create
);







/**
 * @swagger
 * /api/v1/airports:
 *   get:
 *     summary: Get all airports
 *     tags: [Airport]
 *
 *     responses:
 *
 *       200:
 *         description: Airports fetched successfully
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
 *                         example: cmairport123
 *
 *                       name:
 *                         type: string
 *                         example: Chennai International Airport
 *
 *                       code:
 *                         type: string
 *                         example: MAA
 *
 *                       city:
 *                         type: string
 *                         example: Chennai
 *
 *                       country:
 *                         type: string
 *                         example: India
 */
router.get(
  "/",
  findAll
);








/**
 * @swagger
 * /api/v1/airports/{id}:
 *   get:
 *     summary: Get airport by ID
 *     tags: [Airport]
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
 *         example: cmairport123
 *
 *
 *     responses:
 *
 *       200:
 *         description: Airport fetched successfully
 *
 *       404:
 *         description: Airport not found
 */
router.get(
  "/:id",
  findOne
);









/**
 * @swagger
 * /api/v1/airports/{id}:
 *   put:
 *     summary: Update airport details
 *     tags: [Airport]
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
 *         example: cmairport123
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
 *                 example: Kempegowda International Airport
 *
 *               code:
 *                 type: string
 *                 example: BLR
 *
 *               city:
 *                 type: string
 *                 example: Bengaluru
 *
 *               country:
 *                 type: string
 *                 example: India
 *
 *
 *     responses:
 *
 *       200:
 *         description: Airport updated successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Airport not found
 */
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  update
);









/**
 * @swagger
 * /api/v1/airports/{id}:
 *   delete:
 *     summary: Delete airport
 *     tags: [Airport]
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
 *         example: cmairport123
 *
 *
 *     responses:
 *
 *       200:
 *         description: Airport deleted successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Airport not found
 */
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  remove
);



export default router;