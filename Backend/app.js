import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { body, validationResult } from 'express-validator';
import { isLoggedIn } from "./middleware/middleware.js";
import followRoutes from "./routes/follow.js";

// Access your API key as an environment variable (more secure)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const prisma = new PrismaClient();
dotenv.config();

const app = express();
app.use(
    cors({
        origin: "*",  // Temporarily allow all origins for debugging
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());

app.use('/auth', authRoutes);
app.use("/api/follow", followRoutes);
app.get("/api/users/email/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user by email:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/posts/:id',isLoggedIn, async (req, res) => {
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

app.post("/analyze-research",isLoggedIn, async (req, res) => {
    const { researchText } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        const prompt = `Analyze the following research of science and structure the response strictly as a valid JSON object. Do not include any text before or after the JSON object. Ensure the entire response is a single, parsable JSON object.

        ${researchText}\n

        Structure the JSON as follows:

        - research_overview (topic: string, methodology: string, goal: string): Provide a brief overview. 
          If the methodology or goal are not explicitly stated in the text, infer them based on the content. Provide a general statement of the common methodologies and goals on this kind of research and the whole research should be based on science.

        - key_findings (array of objects): Provide a brief overview of the key findings even if they are not clearly mentioned in the text, extract the key findings of the research or generate potential ones. At least generate three key findings.  Each object should have the following keys:
            - area: string (e.g., "Automation and Efficiency")
            - summary: string (A concise summary of the finding.)
            - details: string (A more detailed explanation of the finding.)

        - case_studies (array of objects): Always include exactly 3 case studies. If fewer than 3 are mentioned in the text, create brief fictional examples based on the topic of the research the whole research should be based on science..
            - industry: string
            - application: string
            - description: string (A short description of the application and its impact)

        - conclusion: string: Provide a concluding statement that summarizes the overall impact or significance of the research, even if a formal conclusion is not present in the text the whole research should be based on science..
        - feedback: string: Provide a Feedback statement that summarizes the overall impact or significance of the research, even if a formal feedback is not present in the text the whole research should be based on science..`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        console.log("Raw AI Response:", text); // Log the raw response

        // Clean the response
        text = text.replace(/```json/g, ''); // Remove ```json
        text = text.replace(/```/g, '');    // Remove ```
        text = text.trim();

        try {
            // Parse the JSON response from the AI
            const structuredData = JSON.parse(text);
            res.json(structuredData);
        } catch (parseError) {
            console.error("Error parsing JSON:", parseError);
            console.error("Raw AI Response:", text);
            return res.status(500).json({ error: "Failed to parse JSON from AI response. Check the AI response in the logs." });
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "AI Analysis failed" });
    }
});

app.post("/ask-ai",isLoggedIn, async (req, res) => {
    const { question, researchText } = req.body;

    if (!question || !researchText) {
        return res.status(400).json({ error: "Missing question or research content." });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const prompt = `
            Act as an expert AI assisting with scientific research queries. 
        Provide a concise and informative answer to the following question based solely on the provided research content. 
        Do not include any introductory or concluding remarks. Return only the answer text.

        Research Content: ${researchText}

        Question: ${question}

        and the answer should be in brief for about a page and the answer should be in paragraph
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        console.log("Raw AI Response:", text); // Log the raw response

        // Clean the response
        text = text.replace(/```json/g, ''); // Remove ```json
        text = text.replace(/```/g, '');    // Remove ```
        text = text.trim();

        function escapeControlCharacters(str) {
            return str.replace(/[\u0000-\u001F\u007F-\u009F]/g, function (ch) {
                return "\\u" + ("000" + ch.charCodeAt(0).toString(16)).slice(-4);
            });
        }
        try {
            if (!text || text.trim() === "") {
                // Handle empty or whitespace-only response
                console.log("AI returned an empty response.");
                return res.json({ response: "The AI could not provide an answer based on the research content." });
            }

            // Escape control characters and then wrap in a JSON object
            const escapedText = escapeControlCharacters(text);
            res.json({ response: escapedText });


        } catch (parseError) {
            console.error("Error while processing AI response:", parseError);
            console.error("Raw AI Response:", text);
            return res.status(500).json({ error: "Failed to process AI response." });
        }

    } catch (error) {
        console.error("Error calling Gemini:", error);
        res.status(500).json({ error: "AI request failed." });
    }
});

app.post('/posts',isLoggedIn, async (req, res) => {
    try {
        console.log("Received Data:", req.body)
        const userId = req.user.userId;
        const { title, content, category } = req.body;
        const formattedCategory = category.toUpperCase();
        // Create the post in the database
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                user: { connect: { id: userId } },
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


// Search users by username or email
app.get("/search", async (req, res) => {

    try {
        let { query } = req.query; // Get search query from URL
        console.log(query)

        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        query = query.toUpperCase();

        const results = await prisma.post.findMany({
            where: {
                category: query,
            },
        });

        res.json(results);
        console.log(results);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Centralized error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
