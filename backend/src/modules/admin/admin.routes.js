import { Router } from "express";


import authMiddleware from "../../middleware/auth.middleware.js";

import authorizeRoles from "../../middleware/role.middleware.js";


import {
  users,
  updateRole
} from "./admin.controller.js";


const router = Router();



router.get(
  "/users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  users
);



router.patch(
  "/users/:id/role",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updateRole
);



export default router;