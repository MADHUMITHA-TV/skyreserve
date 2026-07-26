import config from "../config/index.js";

/**
 * Options for the httpOnly refresh token cookie.
 *
 * In production the frontend and backend live on different origins
 * (e.g. vercel.app + railway.app), so the cookie must be:
 *   - secure: true      -> only sent over HTTPS
 *   - sameSite: "none"  -> allowed to be sent cross-site
 *
 * In development both run on http://localhost, so "strict" + non-secure
 * is fine and easier to work with (secure cookies are dropped over http).
 */
const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.env.isProduction,
  sameSite: config.env.isProduction ? "none" : "strict",
  path: "/"
};

export default refreshTokenCookieOptions;