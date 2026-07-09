import app from "./app.js";
import config from "../config/index.js";

const { port } = config.env;

app.listen(port, () => {
  console.log(`🚀 SkyReserve Server running on port ${port}`);
});