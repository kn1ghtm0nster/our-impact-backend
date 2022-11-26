"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../expressError");
const {
	authenticateJWT,
	ensureUserAuthenticated,
	ensureAdmin,
	ensureCorrectUserOrAdmin,
} = require("./auth");

const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", isAdmin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", isAdmin: false }, "wrong");

describe("authenticateJWT", () => {
	it("works via headers", () => {
		expect.assertions(2);

		const req = { headers: { authorization: `Bearer ${testJwt}` } };
		const res = { locals: {} };
		const next = function (err) {
			expect(err).toBeFalsy();
		};
		authenticateJWT(req, res, next);
		expect(res.locals).toEqual({
			user: {
				iat: expect.any(Number),
				username: "test",
				isAdmin: false,
			},
		});
	});

	it("works WITHOUT headers", () => {
		expect.assertions(2);

		const req = {};

		const res = { locals: {} };

		const next = function (err) {
			expect(err).toBeFalsy();
		};

		authenticateJWT(req, res, next);

		expect(res.locals).toEqual({});
	});

	it("works with invalid tokens", () => {
		expect.assertions(2);

		const req = { headers: { authorization: `Bearer ${badJwt}` } };
		const res = { locals: {} };
		const next = function (err) {
			expect(err).toBeFalsy();
		};

		authenticateJWT(req, res, next);

		expect(res.locals).toEqual({});
	});
});

describe("ensureUserAuthenticated", () => {
	test("function works", () => {
		expect.assertions(1);

		const req = {};
		const res = { locals: { user: { username: "test", is_admin: false } } };

		const next = function (err) {
			expect(err).toBeFalsy();
		};

		ensureUserAuthenticated(req, res, next);
	});

	test("error if not authenticated", () => {
		expect.assertions(1);

		const req = {};
		const res = { locals: {} };
		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};

		ensureUserAuthenticated(req, res, next);
	});
});

describe("ensureAdmin", () => {
	test("function works", () => {
		expect.assertions(1);

		const req = {};

		const res = { locals: { user: { username: "test", isAdmin: true } } };

		const next = function (err) {
			expect(err).toBeFalsy();
		};

		ensureAdmin(req, res, next);
	});

	test("error if not admin", () => {
		expect.assertions(1);

		const req = {};

		const res = { locals: { user: { username: "test", isAdmin: false } } };

		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};

		ensureAdmin(req, res, next);
	});

	test("error if not logged in period", function () {
		expect.assertions(1);
		const req = {};
		const res = { locals: {} };
		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureAdmin(req, res, next);
	});
});

describe("ensureCorrectUserOrAdmin", () => {
	test("works with admins", () => {
		expect.assertions(1);

		const req = { params: { username: "test" } };
		const res = { locals: { user: { username: "test", isAdmin: true } } };

		const next = function (err) {
			expect(err).toBeFalsy();
		};

		ensureCorrectUserOrAdmin(req, res, next);
	});

	test("works with same user", () => {
		expect.assertions(1);

		const req = { params: { username: "test" } };
		const res = { locals: { user: { username: "test", isAdmin: false } } };
		const next = function (err) {
			expect(err).toBeFalsy();
		};

		ensureCorrectUserOrAdmin(req, res, next);
	});

	it("throws error for mismatched username", () => {
		expect.assertions(1);

		const req = { params: { username: "wrong" } };
		const res = { locals: { user: { username: "test", isAdmin: false } } };
		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};

		ensureCorrectUserOrAdmin(req, res, next);
	});

	it("throws error for non-authenticated users", () => {
		expect.assertions(1);

		const req = { params: { username: "test" } };
		const res = { locals: {} };
		const next = function (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		};
		ensureCorrectUserOrAdmin(req, res, next);
	});
});
