// server.js — backend for NexCampus (MongoDB + Express)

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // for serving HTML/CSS/JS

// Connect to MongoDB
dbURI = "mongodb://localhost:27017/nexCampus";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected to nexCampus"))
  .catch(err => console.error("MongoDB error:", err));

// Mongoose Schemas
const Student = mongoose.model("StudentRegistration", new mongoose.Schema({
  student_name: String,
  roll_number: { type: String, unique: true },
  course: String,
  year: Number,
  branch: String,
  section: String,
  fathers_name: String,
  address: String,
  password: String
}));

const College = mongoose.model("CollegeRegistration", new mongoose.Schema({
  college_name: String,
  user_id: { type: String, unique: true },
  address: String,
  password: String
}));

const Event = mongoose.model("Event", new mongoose.Schema({
  event_title: String,
  date: String,
  description: String,
  type: String,
  "college-name": String
}));

// =============================
// AUTH ROUTES
// =============================

// Register
app.post("/api/student/register", async (req, res) => {
  try {
    const existing = await Student.findOne({ roll_number: req.body.roll_number });
    if (existing) return res.status(409).json({ message: "Student already exists" });
    const student = new Student(req.body);
    await student.save();
    res.status(201).json({ message: "Student registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/college/register", async (req, res) => {
  try {
    const existing = await College.findOne({ user_id: req.body.user_id });
    if (existing) return res.status(409).json({ message: "College already exists" });
    const college = new College(req.body);
    await college.save();
    res.status(201).json({ message: "College registered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post("/api/student/login", async (req, res) => {
  const { roll_number, password } = req.body;
  const user = await Student.findOne({ roll_number, password });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  res.json(user);
});

app.post("/api/college/login", async (req, res) => {
  const { user_id, password } = req.body;
  const user = await College.findOne({ user_id, password });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  res.json(user);
});

// =============================
// EVENT ROUTES
// =============================

// Post Event
app.post("/api/events", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ message: "Event posted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Events
app.get("/api/events", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// =============================
// START SERVER
// =============================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
