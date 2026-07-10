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


router.post(
  "/register",
  registerValidator,
  register
);


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