// TODO: implement tests for routes file.
const request = require("supertest");

const db = require("../db.js");
const app = require("../app");

const Likes = require("../models/like");

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	u2Token,
	adminToken,
} = require("./_setupForTests");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /likes */
describe("GET /likes tests", () => {
	test("route works as expected", async () => {
		const res = await request(app).get("/likes");

		expect(res.status).toEqual(200);
		expect(res.body).toEqual({
			allLikes: [],
		});
	});

	test("route still works with authenticated users", async () => {
		const res = await request(app)
			.get("/likes")
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.status).toEqual(200);
		expect(res.body).toEqual({
			allLikes: [],
		});
	});
});

/************************************** GET /likes/:username */
describe("GET /likes/:username", () => {
	test("route works as expected for same user", async () => {
		const res = await request(app)
			.get("/likes/routesUser1")
			.set("authorization", `Bearer ${u1Token}`);
		expect(res.status).toEqual(200);
		expect(res.body).toEqual({ userLikes: [] });
	});

	test("route works as expected for admin user", async () => {
		const res = await request(app)
			.get("/likes/routesUser2")
			.set("authorization", `Bearer ${adminToken}`);
		expect(res.status).toEqual(200);
		expect(res.body).toEqual({ userLikes: [] });
	});

	it("throws 401 error for anon users", async () => {
		const res = await request(app).get("/likes/routesUser1");

		expect(res.status).toEqual(401);
	});

	it("throws 404 error for invalid username", async () => {
		const res = await request(app)
			.get("/likes/nope")
			.set("authorization", `Bearer ${adminToken}`);
		expect(res.status).toEqual(404);
	});
});
