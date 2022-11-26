"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	commentIds,
	u1Token,
	u2Token,
	adminToken,
} = require("./_setupForTests");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /users/admin/new-admin */

describe("POST /users/admin/new-admin", () => {
	test("route works as expected for admin users", async () => {
		const res = await request(app)
			.post("/users/admin/new-admin")
			.send({
				username: "admin23",
				password: "secondAdminPassword",
				firstName: "second",
				lastName: "admin",
				email: "admin2electricboogaloo@user.com",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(201);
		expect(res.body).toEqual({ token: expect.any(String) });
	});

	it("returns 400 error for duplicate admin usernames", async () => {
		await request(app)
			.post("/users/admin/new-admin")
			.send({
				username: "admin3",
				password: "adminPass3",
				firstName: "third",
				lastName: "admin",
				email: "admin3electricjamboree@user.com",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${adminToken}`);
		const res = await request(app)
			.post("/users/admin/new-admin")
			.send({
				username: "admin3",
				password: "adminPass3",
				firstName: "third",
				lastName: "admin",
				email: "admin3electricjamboree@user.com",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 401 error for non-admin users", async () => {
		const res = await request(app)
			.post("/users/admin/new-admin")
			.send({
				username: "failAdmin",
				password: "adminPass3",
				firstName: "third",
				lastName: "admin",
				email: "admin3electricjamboree@user.com",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 error for anon users", async () => {
		const res = await request(app).post("/users/admin/new-admin").send({
			username: "nope",
			password: "failureAdd",
			firstName: "does not",
			lastName: "work",
			email: "doesntwork@gmail.com",
			isAdmin: true,
		});

		expect(res.statusCode).toEqual(401);
	});

	it("returns 400 error for missing data", async () => {
		const res = await request(app)
			.post("/users/admin/new-admin")
			.send({
				username: "nope",
				firstName: "does not",
				lastName: "work",
				email: "doesntwork@gmail.com",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toBe(400);
	});

	it("returns 400 error for empty data", async () => {
		const res = await request(app)
			.post("/users/admin/new-admin")
			.send({})
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toBe(400);
	});

	it("returns 400 error for invalid data", async () => {
		const res = await request(app)
			.post("/users/admin/new-admin")
			.send({
				username: true,
				firstName: "does not",
				lastName: "work",
				email: "doesntwork@gmail.com",
				isAdmin: true,
			})
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(400);
	});
	// TODO: write remaining tests to ensure invalid/missing information on required fields still return 400 error on all tests for invalid/missing data
});

/************************************** GET /users/admin/all-users */

describe("GET /users/admin/all-users", () => {
	test("works as expected for admin users", async () => {
		const res = await request(app)
			.get("/users/admin/all-users")
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			users: [
				{
					username: "routesUser1",
					firstName: "U1F",
					lastName: "U1L",
					email: "user1@user.com",
					cityName: "Dallas",
				},
				{
					username: "routesUser2",
					firstName: "U2F",
					lastName: "U2L",
					email: "user2@user.com",
					cityName: "Paris",
				},
				{
					cityName: null,
					email: "admin@user.com",
					firstName: "A1F",
					lastName: "A1L",
					username: "routesAdmin1",
				},
			],
		});
	});

	it("returns 401 error for non-admin users", async () => {
		const res = await request(app)
			.get("/users/admin/all-users")
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 for anon users", async () => {
		const res = await request(app).get("/users/admin/all-users");

		expect(res.statusCode).toEqual(401);
	});
});

/************************************** GET /users/admins */

describe("GET /users/admins", () => {
	test("works as expected for admins", async () => {
		const res = await request(app)
			.get("/users/admins")
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			admins: [
				{
					username: "routesAdmin1",
					firstName: "A1F",
					lastName: "A1L",
					email: "admin@user.com",
					cityName: null,
				},
			],
		});
	});

	it("returns 401 error for non-admin users", async () => {
		const res = await request(app)
			.get("/users/admins")
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 error for anon users", async () => {
		const res = await request(app).get("/users/admins");

		expect(res.statusCode).toEqual(401);
	});
});

/************************************** GET /users/:username */

describe("GET users/:username", () => {
	test("works as expected with admin users", async () => {
		const res = await request(app)
			.get("/users/routesUser1")
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.status).toEqual(200);
		expect(res.body).toEqual({
			user: {
				username: "routesUser1",
				firstName: "U1F",
				lastName: "U1L",
				email: "user1@user.com",
				userCity: "Dallas",
				comments: [],
			},
		});
	});

	test("works as expected for same user token", async () => {
		const res = await request(app)
			.get("/users/routesUser1")
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.status).toEqual(200);
		expect(res.body).toEqual({
			user: {
				username: "routesUser1",
				firstName: "U1F",
				lastName: "U1L",
				email: "user1@user.com",
				userCity: "Dallas",
				comments: [],
			},
		});
	});

	it("returns 401 error for incorrect user token", async () => {
		const res = await request(app)
			.get("/users/routesUser1")
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 for user that does not exist", async () => {
		const res = await request(app)
			.get("/users/nope")
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username", () => {
	test("works as expected for admin users", async () => {
		const res = await request(app)
			.patch("/users/routesUser1")
			.send({
				firstName: "updatedU1F",
				lastName: "updatedU1L",
				userCity: "Beijing",
			})
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			user: {
				username: "routesUser1",
				firstName: "updatedU1F",
				lastName: "updatedU1L",
				email: "user1@user.com",
				userCity: "Beijing",
			},
		});
	});

	test("works as expected for same user token", async () => {
		const res = await request(app)
			.patch("/users/routesUser2")
			.send({
				firstName: "updatedU2F",
				lastName: "updatedU2L",
				userCity: "New Orleans",
			})
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(200);

		expect(res.body).toEqual({
			user: {
				username: "routesUser2",
				firstName: "updatedU2F",
				lastName: "updatedU2L",
				email: "user2@user.com",
				userCity: "New Orleans",
			},
		});
	});

	it("returns 400 error for invalid data", async () => {
		const res = await request(app)
			.patch("/users/routesUser2")
			.send({
				firstName: true,
				lastName: "updatedU2L",
				userCity: "New Orleans",
			})
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 400 error if extra properties added", async () => {
		const res = await request(app)
			.patch("/users/routesUser2")
			.send({
				firstName: "updatedU2F",
				lastName: "updatedU2L",
				userCity: "New Orleans",
				shouldFail: true,
			})
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 401 error for anon users", async () => {
		const res = await request(app).patch("/users/routesUser1").send({
			firstName: "updatedU1F",
			lastName: "updatedU1L",
			userCity: "Beijing",
		});

		expect(res.statusCode).toEqual(401);
	});
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", () => {
	test("works as expected for admin users", async () => {
		const res = await request(app)
			.delete("/users/routesUser2")
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
	});

	test("works as expected for the same user", async () => {
		const res = await request(app)
			.delete("/users/routesUser1")
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
	});

	it("returns 401 error for non-admin users", async () => {
		const res = await request(app)
			.delete("/users/routesUser2")
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 for anon users", async () => {
		const res = await request(app).delete("/users/routesUser1");

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 for different user tokens", async () => {
		const res = await request(app)
			.delete("/users/routeUser2")
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 error for invalid username", async () => {
		const res = await request(app)
			.delete("/users/nope")
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});

	it("returns 404 error if user already deleted", async () => {
		await request(app)
			.delete("/users/routesUser1")
			.set("authorization", `Bearer ${u1Token}`);

		const res = await request(app)
			.delete("/users/routesUser1")
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toBe(404);
	});
});
