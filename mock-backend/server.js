import express from "express";

const app = express();

app.use(express.json());

const port = process.argv[2] || process.env.MOCK_PORT || 4000;

// MUST come before /users/:id
app.get("/users/fail", async (req, res) => {
  if (port === "4001") {
    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    return res.json({
      message: "Delayed response",
      server: port,
    });
  }

  res.json({
    message: "Success",
    server: port,
  });
});

app.get("/users/:id", (req, res) => {
  res.json({
    id: Number(req.params.id),
    name: `User ${req.params.id}`,
    server: port,
  });
});

app.get("/products/:id", (req, res) => {
  res.json({
    id: Number(req.params.id),
    name: `Product ${req.params.id}`,
    price: 999,
    server: port,
  });
});

app.post("/users", (req, res) => {
  res.status(201).json({
    message: "User created",
    user: req.body,
    server: port,
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    server: port,
  });
});

app.listen(port, () => {
  console.log(`Mock backend running on port ${port}`);
});