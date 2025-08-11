const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const aiRoutes = require("./routes/ai.routes");

const prisma = new PrismaClient();
const app = express();

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}

testConnection();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/ai", aiRoutes);

module.exports = app;
