// backend/server.js
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Helper: calculate price
function calculatePrice(planType, personalTrainer) {
  let price = 0;

  if (planType === "biweekly") {
    price = 30; // your base price
    if (personalTrainer) {
      price += 15; // trainer upgrade biweekly
    }
  } else if (planType === "yearly") {
    price = 400; // your base price
    if (personalTrainer) {
      price += 200; // trainer upgrade yearly
    }
  }

  return price;
}

// Test route
app.get("/", (req, res) => {
  res.send("Gym backend API is running");
});

// Create membership
app.post("/api/memberships", (req, res) => {
  const { fullName, email, planType, personalTrainer, cardNumber } = req.body;

  if (!fullName || !email || !planType) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const trainerFlag = personalTrainer ? 1 : 0;
  const price = calculatePrice(planType, trainerFlag);

  // Only store last 4 digits (demo only, not real payment!)
  const cardLast4 =
    typeof cardNumber === "string" && cardNumber.length >= 4
      ? cardNumber.slice(-4)
      : null;

  const createdAt = new Date().toISOString();

  const sql = `
    INSERT INTO memberships
    (full_name, email, plan_type, personal_trainer, price, card_last4, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [fullName, email, planType, trainerFlag, price, cardLast4, createdAt],
    function (err) {
      if (err) {
        console.error("Error saving membership:", err);
        return res.status(500).json({ message: "Database error" });
      }

      res.status(201).json({
        id: this.lastID,
        fullName,
        email,
        planType,
        personalTrainer: !!trainerFlag,
        price,
        cardLast4,
        createdAt,
      });
    }
  );
});

// (Optional) list memberships (for testing)
app.get("/api/memberships", (req, res) => {
  db.all("SELECT * FROM memberships ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching memberships:", err);
      return res.status(500).json({ message: "Database error" });
    }
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
