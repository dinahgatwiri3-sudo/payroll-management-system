import app from "../server/index.js";

// Preserve query filters when forwarding the audit trail endpoint.
export default function handler(req, res) {
  const query = typeof req.url === "string" && req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  req.url = "/api/audit" + query;
  return app(req, res);
}
