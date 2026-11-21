import app from "../../server/index.js";

// Explicit Vercel route for editing one payroll item.
export default function handler(req, res) {
  const id = typeof req.query?.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).json({ error: "Payroll item ID is required." });
  req.url = `/api/payroll-items/${encodeURIComponent(id)}`;
  return app(req, res);
}
