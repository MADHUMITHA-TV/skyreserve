import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import authorizeRoles from "../../middleware/role.middleware.js";

import {
  create,
  findAll,
  findOne,
  update,
  remove
} from "./aircraft.controller.js";

import {
  aircraftValidator
} from "./aircraft.validator.js";


const router = Router();



/**
 * @swagger
 * tags:
 *   name: Aircraft
 *   description: Aircraft management APIs
 */



/**
 * @swagger
 * /api/v1/aircrafts:
 *   post:
 *     summary: Create a new aircraft
 *     tags: [Aircraft]
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
 *               - model
 *               - registrationNumber
 *               - totalSeats
 *               - airlineId
 *
 *             properties:
 *
 *               model:
 *                 type: string
 *                 example: Airbus A320
 *
 *               registrationNumber:
 *                 type: string
 *                 example: VT-ABC123
 *
 *               totalSeats:
 *                 type: integer
 *                 example: 180
 *
 *               airlineId:
 *                 type: string
 *                 example: cmairline123
 *
 *
 *     responses:
 *
 *       201:
 *         description: Aircraft created successfully
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
  aircraftValidator,
  create
);





/**
 * @swagger
 * /api/v1/aircrafts:
 *   get:
 *     summary: Get all aircrafts
 *     tags: [Aircraft]
 *
 *     responses:
 *
 *       200:
 *         description: Aircraft list fetched successfully
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
 *                         example: cmAircraft123
 *
 *                       model:
 *                         type: string
 *                         example: Airbus A320
 *
 *                       registrationNumber:
 *                         type: string
 *                         example: VT-ABC123
 *
 *                       totalSeats:
 *                         type: integer
 *                         example: 180
 *
 *                       status:
 *                         type: string
 *                         example: ACTIVE
 */
router.get(
  "/",
  findAll
);






/**
 * @swagger
 * /api/v1/aircrafts/{id}:
 *   get:
 *     summary: Get aircraft by ID
 *     tags: [Aircraft]
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
 *         example: cmAircraft123
 *
 *
 *     responses:
 *
 *       200:
 *         description: Aircraft fetched successfully
 *
 *       404:
 *         description: Aircraft not found
 */
router.get(
  "/:id",
  findOne
);







/**
 * @swagger
 * /api/v1/aircrafts/{id}:
 *   put:
 *     summary: Update aircraft details
 *     tags: [Aircraft]
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
 *         example: cmAircraft123
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
 *               model:
 *                 type: string
 *                 example: Boeing 737
 *
 *               registrationNumber:
 *                 type: string
 *                 example: VT-XYZ123
 *
 *               totalSeats:
 *                 type: integer
 *                 example: 200
 *
 *               status:
 *                 type: string
 *                 example: ACTIVE
 *
 *
 *     responses:
 *
 *       200:
 *         description: Aircraft updated successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Aircraft not found
 */
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  update
);








/**
 * @swagger
 * /api/v1/aircrafts/{id}:
 *   delete:
 *     summary: Delete aircraft
 *     tags: [Aircraft]
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
 *         example: cmAircraft123
 *
 *
 *     responses:
 *
 *       200:
 *         description: Aircraft deleted successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Admin access required
 *
 *       404:
 *         description: Aircraft not found
 */
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  remove
);



export default router;