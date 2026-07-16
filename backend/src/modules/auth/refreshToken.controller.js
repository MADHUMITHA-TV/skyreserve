import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

import {
  verifyRefreshToken,
  revokeToken
} from "./refreshToken.service.js";

import {
  generateAccessToken
} from "./jwt.util.js";

export const refreshAccessToken = asyncHandler(async (req, res) => {

  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json(
      new ApiResponse(
        false,
        "Refresh token missing"
      )
    );
  }

  const user = await verifyRefreshToken(token);

  const accessToken = generateAccessToken(user);

  return res.status(200).json(
    new ApiResponse(
      true,
      "Token refreshed",
      {
        accessToken
      }
    )
  );
});

export const logout = asyncHandler(async (req, res) => {

  const token = req.cookies.refreshToken;

  if (token) {
    await revokeToken(token);
  }

  res.clearCookie("refreshToken");

  return res.status(200).json(
    new ApiResponse(
      true,
      "Logged out successfully"
    )
  );
});