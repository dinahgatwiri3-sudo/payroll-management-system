import app from "../../../server/index.js";

// Give Vercel an explicit function route for nested payroll status updates.
// Express then handles authentication, validation, and the database update.
export default function handler(req, res) {
  const id = typeof req.query?.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).json({ error: "Payroll ID is required." });
  req.url = `/api/payroll/${encodeURIComponent(id)}/status`;
  return app(req, res);
}
