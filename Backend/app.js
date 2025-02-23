import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(
    cors({
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);
app.use(express.json());

app.use('/auth',authRoutes);


app.get('/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Find the research post by ID
        const post = await prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            return res.status(404).json({ error: "Research post not found" });
        }
        console.log(post)
        res.json(post);
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ error: "Failed to fetch the research post" });
    }
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await prisma.post.findMany({});
        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Failed to fetch research" });
    }
});

app.post('/posts', async (req, res)=>{
    try {
        console.log("Received Data:", req.body)

        const { title, content, category } = req.body;
        const formattedCategory = category.toUpperCase();
        // Create the post in the database
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                category: formattedCategory,
            },
        });
        console.log("new post created");
        return res.status(201).json(newPost);
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ error: "Failed to create post" });
    }
});
app.post("/analyze-research", async (req, res) => {
    const { content } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Summarize and analyze research papers." },
                { role: "user", content: `Analyze the following research: ${content}` }
            ]
        });

        res.json({ summary: response.choices[0].message.content });
    } catch (error) {
        console.error("OpenAI API Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "AI Analysis failed" });
    }
    
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
