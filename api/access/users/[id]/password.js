import app from "../../../../server/index.js";

// Explicit Vercel function route for resetting a user password.
export default function handler(req, res) {
  const id = typeof req.query?.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).json({ error: "User ID is required." });
  req.url = "/api/access/users/" + encodeURIComponent(id) + "/password";
  return app(req, res);
}
