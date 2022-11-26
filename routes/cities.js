"use-strict";

const db = require("../db");
const jsonschema = require("jsonschema");
const addCommentSchema = require("../schemas/newComment.json");
const updateCommentSchema = require("../schemas/updateComment.json");
const express = require("express");
const router = express.Router();
const { BadRequestError, NotFoundError } = require("../expressError");
const City = require("../models/city");
const Comment = require("../models/comment");
const {
	ensureUserAuthenticated,
	ensureCorrectUserOrAdmin,
} = require("../middleware/auth");
/**
 * GET => {cities: [{city_name, country_code, lat, lon}...]}
 *
 * Authorization required: None
 */
router.get("/", async (req, res, next) => {
	try {
		const cities = await City.getAllCities();
		return res.json({ cities });
	} catch (e) {
		return next(e);
	}
});

/**
 * GET => {city: {city_name, country_code, lat, lon}}
 *
 * Authorization required: None
 */

router.get("/:name", async (req, res, next) => {
	try {
		const city = await City.getCity(req.params.name);
		return res.json({ city });
	} catch (e) {
		return next(e);
	}
});

/**
 * GET => {cityData: {city_name, country_code, lat, lon, comments: []}}
 *      WHERE comments => [{id, comment, username, cityName, likes }, ...]
 *
 * Authorization required: YES -> authenticated user w/ valid Token
 */

router.get(
	"/:name/comments",
	ensureUserAuthenticated,
	async (req, res, next) => {
		try {
			let cityData = await City.getCityComments(req.params.name);
			return res.json({ cityData });
		} catch (e) {
			return next(e);
		}
	}
);

/**
 * GET => /cities/:name/comments/:id
 *
 * RETURNS {comment: {id, comment, username, cityName, likes}}
 *
 * Authorization required: YES -> authenticated user w/ valid Token
 *
 */
router.get(
	"/:name/comments/:id",
	ensureUserAuthenticated,
	async (req, res, next) => {
		try {
			// logic for returning the single comment.
			const { id } = req.params;
			const comment = await Comment.getSingleCommentForCity(id);

			return res.json({ comment });
		} catch (err) {
			return next(err);
		}
	}
);

/**
 * POST => /cities/:name/comments/new
 *
 * RETURNS {"comment": {"comment_id", "comment", "username", "cityName", "likes"}}
 *
 * Authorization required: YES -> authenticated user.
 *
 */

router.post(
	"/:name/comments/new",
	ensureUserAuthenticated,
	async (req, res, next) => {
		try {
			const { commentText, author, locationName } = req.body;
			const validator = jsonschema.validate(req.body, addCommentSchema);
			if (!validator.valid) {
				const errs = validator.errors.map((e) => e.stack);
				throw new BadRequestError(errs);
			}
			const isValidCity = await City.getCity(req.params.name);
			if (!isValidCity) throw new NotFoundError("Invalid city name");
			const comment = await City.addNewComment({
				commentText,
				author,
				locationName,
			});
			return res.status(201).json({ comment });
		} catch (err) {
			return next(err);
		}
	}
);

/**
 * PATCH => /cities/:name/:username/comments/edit/:id
 *
 * RETURNS {"updated": "updatedComment"}
 *
 * Authorization required: YES -> authenticated user OR admin user.
 *
 */

router.patch(
	"/:name/:username/comments/edit/:id",
	ensureCorrectUserOrAdmin,
	async (req, res, next) => {
		try {
			const { id } = req.params;
			const validator = jsonschema.validate(
				req.body,
				updateCommentSchema
			);
			if (!validator.valid) {
				const errs = validator.errors.map((e) => e.stack);
				throw new BadRequestError(errs);
			}

			const updatedComment = await City.updateComment(id, req.body);
			return res
				.status(200)
				.json({ updated: updatedComment.commentText });
		} catch (err) {
			return next(err);
		}
	}
);

/**
 * DELETE => /cities/:name/:username/comments/delete/:id
 *
 * RETURNS {"deleted": "id"}
 *
 * Authorization required: YES -> authenticated user OR admin user.
 *
 */

router.delete(
	"/:name/:username/comments/delete/:id",
	ensureCorrectUserOrAdmin,
	async (req, res, next) => {
		try {
			const { id } = req.params;

			await City.deleteComment(id);
			return res.json({ deleted: id });
		} catch (err) {
			return next(err);
		}
	}
);

module.exports = router;
