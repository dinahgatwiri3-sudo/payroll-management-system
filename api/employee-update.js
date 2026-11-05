import app from "../server/index.js";

// Use a fixed Vercel function path for employee updates. Vercel routes this
// file reliably, then Express handles the existing authenticated PATCH route.
export default function handler(req, res) {
  const id = typeof req.query?.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).json({ error: "Employee ID is required." });
  req.url = `/api/employees/${encodeURIComponent(id)}`;
  return app(req, res);
}
