const express = require("express");
const jsonschema = require("jsonschema");
const updateCommnetSchema = require("../schemas/updateComment.json");

const {
	ensureUserAuthenticated,
	ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Comment = require("../models/comment");
const User = require("../models/user");

const router = express.Router();

/** GET => /comments/:id
 *
 * RETURNS {comment: {id, comment, username, cityName, likes}}
 *
 * Authorization required: Logged in user w/ valid Token
 *
 */
router.get("/:id", ensureUserAuthenticated, async (req, res, next) => {
	try {
		const { id } = req.params;
		const comment = await Comment.getSingleComment(id);

		return res.json({ comment });
	} catch (err) {
		return next(err);
	}
});

/** POST => /comments/:id/add
 *
 * RETURNS {newLike: {comment_id, likes}}
 *
 * Authorization required: Logged in user w/ valid Token
 *
 */
router.post("/:id/add", ensureUserAuthenticated, async (req, res, next) => {
	try {
		const fromUsername = res.locals.user.username;
		const { id } = req.params;
		const newLike = await Comment.addLikeToComment(id, fromUsername);

		return res.status(201).json({ newLike: newLike });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /comments/:id/remove
 *
 * RETURNS => {removedLike: id}
 *
 * Authorization required: Logged in user w/ valid Token
 *
 */
router.delete(
	"/:id/remove",
	ensureUserAuthenticated,
	async (req, res, next) => {
		try {
			const { id } = req.params;

			await Comment.removeCommentLike(id);

			return res.json({ removedLike: id });
		} catch (err) {
			return next(err);
		}
	},
);

/** GET => /comments/:username/all
 *
 * RETURNS => {comments: [id, comment, username, cityName, likes]}
 *
 * Authorization required: Loggedin user OR admin type user
 *
 */
router.get(
	"/:username/all",
	ensureCorrectUserOrAdmin,
	async (req, res, next) => {
		try {
			const { username } = req.params;

			const comments = await Comment.getUserComments(username);

			return res.json({ comments });
		} catch (err) {
			return next(err);
		}
	},
);

/** GET => /comments/:username/:commentId
 *
 * RETURNS => {comment: {id, comment, username, cityName, likes}}
 *
 * Authorization required: Logged in user w/ valid Token and admin type user
 *
 */
router.get(
	"/:username/:commentId",
	ensureCorrectUserOrAdmin,
	async (req, res, next) => {
		try {
			// logic for getting a single comment for a user.
			const { username, commentId } = req.params;

			const comment = await Comment.getSingleUserComment(
				username,
				commentId,
			);

			return res.json({ comment });
		} catch (err) {
			return next(err);
		}
	},
);

/** PATCH => /comments/:username/:commentId
 *
 * RETURNS => {updated: commentText}
 *
 * if either username or commentId are not found, raise 404 NotFoundError
 *
 * Authorization required: Logged in user w/ valid Token or admin type user
 */
router.patch(
	"/:username/:commentId",
	ensureCorrectUserOrAdmin,
	async (req, res, next) => {
		try {
			const { username, commentId } = req.params;

			// ensure that the username in the query params is valid username.
			await User.getUser(username);

			// ensure that the commentId in the query params is valid id.
			await Comment.getSingleComment(commentId);

			const validator = jsonschema.validate(
				req.body,
				updateCommnetSchema,
			);

			if (!validator.valid) {
				const errs = validator.errors.map((e) => e.stack);
				throw new BadRequestError(errs);
			}

			const updatedComment = await Comment.updateComment(
				commentId,
				req.body,
			);

			return res.json({ updated: updatedComment.commentText });
		} catch (err) {
			return next(err);
		}
	},
);

/** DELETE => comments/:username/:commentId
 *
 * RETURNS => {"deleted" : commentId}
 *
 * if either username or commentId are not found, raise 404 NotFoundError
 *
 * Authorization required: Logged in user w/ valid Token or admin type user
 */
router.delete(
	"/:username/:commentId",
	ensureCorrectUserOrAdmin,
	async (req, res, next) => {
		try {
			const { username, commentId } = req.params;

			// ensure that the username in the query params is valid username.
			await User.getUser(username);

			// ensure that the commentId in the query params is valid id.
			await Comment.getSingleComment(commentId);

			await Comment.deleteComment(commentId);

			return res.json({ deleted: commentId });
		} catch (err) {
			return next(err);
		}
	},
);

module.exports = router;
