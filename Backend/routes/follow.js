import { PrismaClient } from "@prisma/client";
import express from "express";
import { isLoggedIn } from "../middleware/middleware.js";

const prisma = new PrismaClient();
const router = express.Router();

router.post("/follow",isLoggedIn, async (req, res) => {
    console.log("Request Body:", req.body); // Debugging Log

    const { followerId, followingId } = req.body;

    if (!followerId || !followingId) {
        return res.status(400).json({ error: "Both followerId and followingId are required." });
    }

    try {
        const follow = await prisma.follow.create({
            data: { followerId, followingId },
        });
        res.json({ success: true, follow });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/unfollow",isLoggedIn, async (req, res) => {
    const { followerId, followingId } = req.body;

    try {
        await prisma.follow.deleteMany({
            where: { followerId, followingId },
        });

        res.json({ success: true, message: "Unfollowed successfully." });
    } catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get list of users the current user is following
router.get("/following/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: { following: true },
        });

        res.json({ success: true, following });
    } catch (error) {
        console.error("Error fetching following users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.post("/status", async (req, res) => {
    const { followerId, researcherIds } = req.body;

    try {
        const followStatus = {};

        for (let researcherId of researcherIds) {
            const isFollowing = await prisma.follow.findFirst({
                where: {
                    followerId: followerId, // ✅ Corrected: Moved inside `where`
                    followingId: researcherId
                }
            });
            followStatus[researcherId] = !!isFollowing; // Convert to true/false
        }

        res.json({ success: true, followingState: followStatus });
    } catch (error) {
        console.error("Error fetching follow status:", error);
        res.status(500).json({ success: false, message: "Error fetching follow status" });
    }
});


export default router;
