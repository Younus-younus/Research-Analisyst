import bcrypt from "bcryptjs";
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import jwt from "jsonwebtoken";
import { userOperations } from "../models/firestore.js";

const app = express();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 8 && password.length <= 128;
};

const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

// Middleware to parse JSON body
app.use(express.json({ limit: '10mb' }));
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(cors());

export const signup = async (req, res) => {
  try {
    const { email, username, category, password } = req.body;

    // Input validation
    if (!email || !username || !category || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedCategory = sanitizeInput(category);

    // Validate email format
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate username
    if (!validateUsername(sanitizedUsername)) {
      return res.status(400).json({ error: "Username must be 3-30 characters and contain only letters, numbers, and underscores" });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be 8-128 characters long" });
    }

    // Check if username already exists
    const existingUser = await userOperations.findByUsername(sanitizedUsername);
    if (existingUser) {
      return res.status(409).json({ error: "Username already taken" });
    }

    // Check if email already exists
    const existingEmail = await userOperations.findByEmail(sanitizedEmail);
    if (existingEmail) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash the password with higher cost
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const formattedCategory = sanitizedCategory.toUpperCase();
    const user = await userOperations.create({
      email: sanitizedEmail,
      username: sanitizedUsername,
      category: formattedCategory,
      password: hashedPassword,
    });

    // Generate a token with shorter expiration
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with success message and token (don't send sensitive data)
    return res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        category: user.category
      },
      redirectTo: "/Login.tsx",
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// Login logic
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Sanitize inputs
    const sanitizedUsername = sanitizeInput(username);

    // Validate username format
    if (!validateUsername(sanitizedUsername)) {
      return res.status(400).json({ error: "Invalid username format" });
    }

    // Find the user by username
    const user = await userOperations.findByUsername(sanitizedUsername);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password with constant-time comparison
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token with shorter expiration
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        category: user.category
      },
      redirectTo: "/Home.tsx",
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
