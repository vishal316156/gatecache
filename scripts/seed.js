import { connectDB } from "../src/config/database.js";
import { Route } from "../src/models/route.model.js";

await connectDB();

await Route.deleteMany({});

await Route.insertMany([
  {
    prefix: "/users",
    targets: [
      "http://backend-1:4001",
      "http://backend-2:4002",
      "http://backend-3:4003",
    ],
    enabled: true,
  },
  {
    prefix: "/products",
    targets: [
      "http://backend-1:4001",
      "http://backend-2:4002",
      "http://backend-3:4003",
    ],
    enabled: true,
  },
]);

console.log("Routes seeded successfully");

process.exit(0);