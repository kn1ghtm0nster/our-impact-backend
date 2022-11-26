"use strict";

const express = require("express");
const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");
const newUserSchema = require("../schemas/newUser.json");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/token");

const router = express.Router();

/**
 * GET /users/admin/all-users => {users: [{username, firstName, lastName, email, cityName}, ...]}
 *
 * Returns an array of objects with user information.
 *
 * Authorization required: Admin
 *
 */
router.get("/admin/all-users", ensureAdmin, async (req, res, next) => {
	try {
		const users = await User.getAllUsers();
		return res.json({ users });
	} catch (err) {
		return next(err);
	}
});

/**
 * GET => /users/admins => {admins: [{username, firstName, lastName, email, cityName}, ...]}
 *
 * Returns array of all ADMIN type users ONLY.
 *
 * Authorization required: Admin
 *
 */
router.get("/admins", ensureAdmin, async (req, res, next) => {
	try {
		const admins = await User.getAdminUsers();
		return res.json({ admins });
	} catch (err) {
		return next(err);
	}
});
/**
 * POST /users/admin/new-admin => {token}
 *
 * Adds a new user. This route is for ADMIN users only. The new user added will be added as an admin.
 *
 * This returns the newly created user and auth token.
 *
 * Authorization required: Admin ONLY
 *
 */
router.post("/admin/new-admin", ensureAdmin, async (req, res, next) => {
	try {
		const validator = jsonschema.validate(req.body, newUserSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const user = await User.registerNewAdmin({ ...req.body });
		const token = createToken(user);
		return res.status(201).json({ token });
	} catch (err) {
		return next(err);
	}
});

/**
 * GET /users/:username => {user}
 *
 * Returns {username, firstName, lastName, email, userCity, comments}
 *
 * Authorization required: Admin or user is same as username
 *
 */
router.get("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
	try {
		const user = await User.getUser(req.params.username);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/**
 * PATCH /users/:username => {user}
 *
 * Data for update can include:
 * 	{username, firstName, lastName, email, cityName}
 *
 * returns {username, firstName, lastName, email, cityName}
 *
 * Authorization required: Admin or user is same as username
 *
 */
router.patch("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
	try {
		const validator = jsonschema.validate(req.body, userUpdateSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const user = await User.updateUser(req.params.username, req.body);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/**
 * DELETE /users/:username => {deleted: username}
 *
 * Authorization required: Admin or user is same as username
 *
 */
router.delete(
	"/:username",
	ensureCorrectUserOrAdmin,
	async (req, res, next) => {
		try {
			await User.deleteUser(req.params.username);
			return res.json({ deleted: req.params.username });
		} catch (err) {
			return next(err);
		}
	}
);

// TODO: Consider updating the admin register route to return the user object AND the token since we are getting the user object back from the backend models file

module.exports = router;
