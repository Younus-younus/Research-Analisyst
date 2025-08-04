import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import multer from "multer";
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { isLoggedIn } from "./middleware/middleware.js";
import { postOperations, userOperations } from "./models/firestore.js";
import authRoutes from "./routes/authRoutes.js";
import followRoutes from "./routes/follow.js";

// These are required to simulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables first
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'GEMINI_API_KEY'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Access your API key as an environment variable (more secure)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit AI requests
  message: { error: "Too many AI requests, please try again later." },
});

app.use(generalLimiter);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://research-analisyst.vercel.app',
      'https://research-analisyst.onrender.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));

const upload = multer({ dest: path.join(__dirname, "uploads") });
app.use(express.static(path.join(__dirname, 'dist')));

app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
        }
    },
}));

app.use('/auth', authRoutes);
app.use("/api/follow", followRoutes);
app.get("/api/users/email/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const user = await userOperations.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user by email:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/posts/:id', isLoggedIn, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the research post by ID
        const post = await postOperations.findById(id);

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
        const posts = await postOperations.findAll();
        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Failed to fetch research" });
    }
});

// Input validation and sanitization functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '').substring(0, 10000); // Limit length
};

const validateResearchText = (text) => {
  return text && text.length >= 10 && text.length <= 50000;
};

const validateQuestion = (question) => {
  return question && question.length >= 3 && question.length <= 1000;
};

app.post("/analyze-research", aiLimiter, isLoggedIn, async (req, res) => {
  try {
    const { researchText } = req.body;
    
    // Input validation
    if (!researchText) {
      return res.status(400).json({ error: "Research text is required" });
    }

    const sanitizedText = sanitizeInput(researchText);
    
    if (!validateResearchText(sanitizedText)) {
      return res.status(400).json({ error: "Research text must be between 10 and 50,000 characters" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `Analyze the following research of science and structure the response strictly as a valid JSON object. Do not include any text before or after the JSON object. Ensure the entire response is a single, parsable JSON object.

    ${sanitizedText}\n

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

app.post("/ask-ai", aiLimiter, isLoggedIn, async (req, res) => {
  try {
    const { question, researchText } = req.body;

    // Input validation
    if (!question || !researchText) {
      return res.status(400).json({ error: "Missing question or research content." });
    }

    const sanitizedQuestion = sanitizeInput(question);
    const sanitizedResearchText = sanitizeInput(researchText);

    if (!validateQuestion(sanitizedQuestion)) {
      return res.status(400).json({ error: "Question must be between 3 and 1,000 characters" });
    }

    if (!validateResearchText(sanitizedResearchText)) {
      return res.status(400).json({ error: "Research text must be between 10 and 50,000 characters" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const prompt = `
        Act as an expert AI assisting with scientific research queries. 
    Provide a concise and informative answer to the following question based solely on the provided research content. 
    Do not include any introductory or concluding remarks. Return only the answer text.

    Research Content: ${sanitizedResearchText}

    Question: ${sanitizedQuestion}

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

app.post('/posts', isLoggedIn, upload.single('document'), async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        const userId = req.user.userId;
        const { title, content, category } = req.body;

        // Input validation
        if (!title || !content || !category) {
            return res.status(400).json({ error: "Title, content, and category are required" });
        }

        // Sanitize inputs
        const sanitizedTitle = sanitizeInput(title).substring(0, 200);
        const sanitizedContent = sanitizeInput(content).substring(0, 50000);
        const sanitizedCategory = sanitizeInput(category);

        // Validate inputs
        if (sanitizedTitle.length < 3) {
            return res.status(400).json({ error: "Title must be at least 3 characters long" });
        }

        if (sanitizedContent.length < 10) {
            return res.status(400).json({ error: "Content must be at least 10 characters long" });
        }

        const formattedCategory = sanitizedCategory.toUpperCase();
        
        // Create the post in the database
        const newPost = await postOperations.create({
            title: sanitizedTitle,
            content: sanitizedContent,
            userId,
            category: formattedCategory,
        });
        
        console.log("New post created successfully");
        return res.status(201).json({
            message: "Post created successfully",
            post: {
                id: newPost.id,
                title: newPost.title,
                category: newPost.category,
                userId: newPost.userId
            }
        });
    } catch (error) {
        console.error("Error creating post:", error.message);
        return res.status(500).json({ error: "Failed to create post" });
    }
});


// Search users by username or email
app.get("/search", generalLimiter, async (req, res) => {
    try {
        let { query } = req.query; // Get search query from URL
        console.log("Search query:", query);

        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        // Sanitize and validate search query
        const sanitizedQuery = sanitizeInput(query);
        
        if (sanitizedQuery.length < 2 || sanitizedQuery.length > 100) {
            return res.status(400).json({ error: "Search query must be between 2 and 100 characters" });
        }

        const upperCaseQuery = sanitizedQuery.toUpperCase();
        const results = await postOperations.findByCategory(upperCaseQuery);

        // Limit and sanitize results
        const sanitizedResults = results.slice(0, 50).map(result => ({
            id: result.id,
            title: result.title ? result.title.substring(0, 200) : '',
            category: result.category,
            createdAt: result.createdAt,
            userId: result.userId
        }));

        res.json(sanitizedResults);
    } catch (error) {
        console.error("Search error:", error.message);
        res.status(500).json({ error: "Search failed" });
    }
});

// Centralized error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 1000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
