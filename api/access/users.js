import app from "../../server/index.js";

// Explicit Vercel function route for the administrator user list.
export default function handler(req, res) {
  req.url = "/api/access/users";
  return app(req, res);
}
