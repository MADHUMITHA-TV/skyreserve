import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is running
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SkyReserve API is running"
  });
});

export default router;