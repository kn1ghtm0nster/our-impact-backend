"use strict";

const jsonschema = require("jsonschema");

const User = require("../models/user");
const express = require("express");
const router = express.Router();
const userRegisterSchema = require("../schemas/userRegister.json");
const userAuthSchema = require("../schemas/userAuth.json");
const { createToken } = require("../helpers/token");
const { BadRequestError } = require("../expressError");

/**
 * POST => /auth/token
 *
 * RETURNS => {token}
 *
 * Main route for generating a new token for a user that is already setup on backend db.
 *
 */
router.post("/token", async (req, res, next) => {
	try {
		const validator = jsonschema.validate(req.body, userAuthSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const { username, password } = req.body;
		const user = await User.authenticateUser(username, password);
		const token = createToken(user);
		return res.json({ token });
	} catch (err) {
		return next(err);
	}
});

/**
 * POST => /auth/register
 *
 * RETURNS => {token}
 *
 * Register route for new users to be added to backend db along with their hashed password.
 *
 */
router.post("/register", async (req, res, next) => {
	try {
		const validator = jsonschema.validate(req.body, userRegisterSchema);
		if (!validator.valid) {
			const errs = validator.errors.map((e) => e.stack);
			throw new BadRequestError(errs);
		}

		const newUser = await User.registerUser({ ...req.body });
		const token = createToken(newUser);
		return res.status(201).json({ token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
