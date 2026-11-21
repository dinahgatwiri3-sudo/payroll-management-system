import app from "../../../server/index.js";

// Explicit Vercel route for listing items in a payroll run.
export default function handler(req, res) {
  const id = typeof req.query?.id === "string" ? req.query.id : "";
  if (!id) return res.status(400).json({ error: "Payroll ID is required." });
  req.url = `/api/payroll/${encodeURIComponent(id)}/items`;
  return app(req, res);
}
