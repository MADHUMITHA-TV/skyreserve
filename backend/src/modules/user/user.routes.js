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



router.get(
  "/profile",
  authMiddleware,
  profile
);



router.put(
  "/profile",
  authMiddleware,
  updateProfileValidator,
  update
);



export default router;