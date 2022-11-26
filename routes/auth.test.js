"use strict";

const request = require("supertest");

const app = require("../app");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
} = require("./_setupForTests");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/token */
describe("POST /auth/token", () => {
	it("works as expected", async () => {
		const res = await request(app).post("/auth/token").send({
			username: "routesUser1",
			password: "password1",
		});

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({ token: expect.any(String) });
	});

	it("should return 401 code for invalid login info", async () => {
		const res = await request(app).post("/auth/token").send({
			username: "does-not-work",
			password: "password1",
		});

		expect(res.body).toEqual({
			error: { message: "Invalid username/password", status: 401 },
		});
		expect(res.statusCode).toEqual(401);
	});

	it("should return 401 for invalid username/password", async () => {
		const res = await request(app).post("/auth/token").send({
			username: "",
			password: "oopswrongpassword",
		});

		expect(res.body).toEqual({
			error: { message: "Invalid username/password", status: 401 },
		});
		expect(res.statusCode).toEqual(401);
	});

	it("throws 400 error for missing information", async () => {
		const res = await request(app).post("/auth/token").send({
			username: "u2",
		});

		expect(res.statusCode).toEqual(400);
	});

	it("throws 400 error for invalid data", async () => {
		const res = await request(app).post("/auth/token").send({
			username: 47,
			password: "haha-number-above",
		});

		expect(res.statusCode).toEqual(400);
	});
});

/************************************** POST /auth/register */
describe("POST /auth/register", () => {
	it("works as expected for new user", async () => {
		const res = await request(app).post("/auth/register").send({
			username: "newUser",
			password: "newUserPassword",
			firstName: "new",
			lastName: "user",
			email: "newUser@user.com",
		});

		expect(res.statusCode).toEqual(201);
		expect(res.body).toEqual({ token: expect.any(String) });
	});

	it("returns 400 error for duplicate username", async () => {
		await request(app).post("/auth/register").send({
			username: "newUser",
			password: "newUserPassword",
			firstName: "new",
			lastName: "user",
			email: "newUser@user.com",
		});

		const res = await request(app).post("/auth/register").send({
			username: "newUser",
			password: "newUserPassword",
			firstName: "new",
			lastName: "user",
			email: "newUser@user.com",
		});

		expect(res.statusCode).toEqual(400);
	});

	it("returns 400 error for missing data", async () => {
		const res = await request(app).post("/auth/register").send({
			username: "failure",
		});

		expect(res.statusCode).toEqual(400);
	});

	it("returns 400 error for invalid data", async () => {
		const res = await request(app).post("/auth/register").send({
			username: "newUser",
			password: "newUserPassword",
			firstName: "new",
			lastName: "user",
			email: "invalidEmail",
		});

		expect(res.statusCode).toEqual(400);
	});
});
