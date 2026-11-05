import "dotenv/config";
import app from "./index.js";

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Payroll API listening on http://localhost:${port}`);
});
