import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./config/database.js";
import "./config/redis.js";
import { startHealthChecks } from "./services/gateway/health.service.js";

const startServer = async () => {
  await connectDB();
  await startHealthChecks();

  app.listen(env.port, () => {
    console.log(`GateCache running on port ${env.port}`);
  });
};

startServer();