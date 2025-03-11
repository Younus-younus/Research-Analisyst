import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import express from 'express';
import cors from 'cors';
const app = express();

// Middleware to parse JSON body
app.use(express.json());
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const prisma = new PrismaClient();
app.use(cors());

export const signup = async (req, res) => {
  const { email, username, category, password } = req.body;

  try {
      // Check if username already exists
      const existingUser = await prisma.user.findFirst({
          where: { username },
      });

      if (existingUser) {
          return res.status(400).json({ error: "Username already taken" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const formattedCategory = category.toUpperCase();
      const user = await prisma.user.create({
          data: {
              email,
              username,
              category: formattedCategory,
              password: hashedPassword,
          },
      });

      // Generate a token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,  // ✅ Make it consistent
        { expiresIn: "1h" }
    );
    

      // Respond with success message and token
      return res.status(200).json({
          message: "Signup successful",
          token,
          redirectTo: "/Login.tsx",
      });
  } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ error });
  }
};


// Login logic
export const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // Find the user by username
    const user = await prisma.user.findFirst({ // Use findFirst() instead of findUnique()
      where: { username },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).json({
      message: "Login successful",
      token,
      redirectTo: "/Home.tsx",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
