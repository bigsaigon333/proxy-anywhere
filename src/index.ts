import { startServer } from "./startServer.js";

try {
  await startServer();
} catch (err) {
  process.exit(1);
}
