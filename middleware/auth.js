"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");

/**
 *
 * If token is provided, then validate token and store the payload on res.locals object.
 *
 * If token is not provided OR if the token is invalid, no error is returned.
 * @returns {Object {token: string}}
 */

const authenticateJWT = (req, res, next) => {
	try {
		const authHeader = req.headers && req.headers.authorization;
		if (authHeader) {
			const token = authHeader.replace(/^[Bb]earer/, "").trim();
			res.locals.user = jwt.verify(token, SECRET_KEY);
		}
		return next();
	} catch (err) {
		return next();
	}
};

/**
 *
 * Authentication middleware to ensure a user is logged in and if not, then raise UnauthorizedError
 */
const ensureUserAuthenticated = (req, res, next) => {
	try {
		if (!res.locals.user) throw new UnauthorizedError();
		return next();
	} catch (err) {
		return next(err);
	}
};

/**
 * Middlware to verify user is admin and if not, raise UnauthorizedError
 */
const ensureAdmin = (req, res, next) => {
	try {
		if (!res.locals.user || !res.locals.user.isAdmin) {
			throw new UnauthorizedError();
		}
		return next();
	} catch (err) {
		return next(err);
	}
};

/**
 * Middlware to verify logged user is admin OR if the logged in user is the same as user requested and if not, raise UnauthorizedError
 *
 * username provided by route params object
 */
function ensureCorrectUserOrAdmin(req, res, next) {
	try {
		const user = res.locals.user;
		if (
			!(user && (user.isAdmin || user.username === req.params.username))
		) {
			throw new UnauthorizedError();
		}
		return next();
	} catch (err) {
		return next(err);
	}
}

module.exports = {
	authenticateJWT,
	ensureUserAuthenticated,
	ensureAdmin,
	ensureCorrectUserOrAdmin,
};
