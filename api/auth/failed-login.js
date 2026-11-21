import app from "../../server/index.js";

// Explicit Vercel function route for recording failed sign-in attempts.
export default function handler(req, res) {
  req.url = "/api/auth/failed-login";
  return app(req, res);
}
