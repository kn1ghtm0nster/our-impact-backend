const express = require("express");

const { ensureAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");

const Likes = require("../models/like");

const router = express.Router();

/**
 * GET /likes => {allLikes: [{id, commentId, username, fromUser}, ...]}
 *
 * Main route for getting all likes from the backend db.
 *
 * Authorization required: None (for now)
 */
router.get("/", async (req, res, next) => {
	try {
		const allLikes = await Likes.getAllLikes();
		return res.json({ allLikes });
	} catch (err) {
		return next(err);
	}
});

/**
 * GET /likes/:username => {userLikes: [{id, commentId, fromUser}, ...]}
 *
 * Main route for getting all likes for a specific username.
 *
 */
router.get("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
	const { username } = req.params;
	try {
		const userLikes = await Likes.getLikesForUser(username);
		return res.json({ userLikes });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
