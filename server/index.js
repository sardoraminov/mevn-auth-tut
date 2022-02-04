require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: "*" }));

// connect to mongoose
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("connected to mongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/api/register", async (req, res) => {
  try {
    const user = await new User(req.body);
    const token = jwt.sign({ user }, process.env.TOKEN_SECRET);

    await user.save();

    res.json({ ok: true, msg: "User registered", user, token });
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.json({ ok: false, msg: "User not found" });
    }
    const token = jwt.sign({ user }, process.env.TOKEN_SECRET);

    res.json({ ok: true, msg: "User login!", user, token });
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/api/loggedIn", (req, res) => {
  const tokenFromUser = req.headers["authorization"];
  if (tokenFromUser) {
    // verify token in variable
    const verifiedToken = jwt.verify(tokenFromUser, process.env.TOKEN_SECRET);
    // if verified, send user
    res.json({ ok: true, msg: "User logged in!", user: verifiedToken.user });
  } else {
    res.json({ ok: false, msg: "User not logged in" });
  }
});

app.get("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true, msg: "User logged out!" });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
