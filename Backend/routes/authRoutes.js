import express from "express";
import { signup, login } from "../controllers/authController.js";
const app = express();
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
// Middleware to parse JSON body
app.use(express.json());

const router = express.Router();

// Signup route
router.post("/signup", signup);

// Login route
router.post("/login", login);

router.post("/logout", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ error: "No token provided for logout." });
    }
  
    tokenBlacklist.add(token);
    res.status(200).json({ message: "Logged out successfully." });
  });

export default router;
