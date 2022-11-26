const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const City = require('../models/city');

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

/************************************** GET /comments/:id */

describe("GET /comments/:id", () => {
	test("route works as expected for admin users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app)
			.get(`/comments/${comment.comment_id}`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
	});

	test("route works as expected for same user", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app)
			.get(`/comments/${comment.comment_id}`)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
	});

	it("returns 401 error for anon users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app).get(`/comments/${comment.comment_id}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 for invalid comment id", async () => {
		const res = await request(app)
			.get("/comments/444444")
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** POST /comments/:id/add */

describe("POST /comments/:id/add", () => {
	test("route works as expected for authenticated users and adds like to comment", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app)
			.post(`/comments/${comment.comment_id}/add`)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(201);
		expect(res.body).toEqual({
			newLike: {
				comment_id: comment.comment_id,
				likes: "1",
			},
		});
	});

	it("returns 401 for anon users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app).post(`/comments/${comment.comment_id}/add`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 for invalid comment id", async () => {
		const res = await request(app)
			.post(`/comments/9990/add`)
			.set("authorization", `Bearer ${u1Token}`);
		expect(res.statusCode).toEqual(404);
	});
});

/************************************** DELETE /comments/:id/remove */

describe("DELETE /comments/:id/remove", () => {
	test("route works as expected for authenticated users and removes likes from comments", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		await request(app)
			.post(`/comments/${comment.comment_id}/add`)
			.set("authorization", `Bearer ${u1Token}`);

		const res = await request(app)
			.delete(`/comments/${comment.comment_id}/remove`)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			removedLike: `${comment.comment_id}`,
		});
	});

	it("returns 401 for anon users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		await request(app)
			.post(`/comments/${comment.comment_id}/add`)
			.set("authorization", `Bearer ${u1Token}`);

		const res = await request(app).delete(
			`/comments/${comment.comment_id}/remove`
		);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 for invalid comment id", async () => {
		const res = await request(app)
			.delete(`/comments/9990/remove`)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** GET /comments/:username/all */

describe("GET /comments/:username/all", () => {
	test("route works as expected for admin users", async () => {
		await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app)
			.get(`/comments/routesUser2/all`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);

		expect(res.body).toEqual({
			comments: [
				{
					id: expect.any(Number),
					comment: "comment from routesUser2",
					username: "routesUser2",
					cityName: "Paris",
					likes: "0",
				},
			],
		});
	});

	test("route works as expected for same user", async () => {
		await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app)
			.get(`/comments/routesUser2/all`)
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(200);

		expect(res.body).toEqual({
			comments: [
				{
					id: expect.any(Number),
					comment: "comment from routesUser2",
					username: "routesUser2",
					cityName: "Paris",
					likes: "0",
				},
			],
		});
	});

	it("returns 401 error for anon users", async () => {
		await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app).get(`/comments/routesUser2/all`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 for invalid username", async () => {
		const res = await request(app)
			.get(`/comments/invalid/all`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** GET /comments/:username/commentId */

describe("GET /comments/:username/:commentId", () => {
	test("route works as expected for admin users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app)
			.get(`/comments/routesUser2/${comment.comment_id}`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			comment: {
				id: expect.any(Number),
				comment: "comment from routesUser2",
				username: "routesUser2",
				cityName: "Paris",
				likes: 0,
			},
		});
	});

	test("route works for same users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app)
			.get(`/comments/routesUser1/${comment.comment_id}`)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			comment: {
				id: expect.any(Number),
				comment: "comment from routesUser1",
				username: "routesUser1",
				cityName: "Dallas",
				likes: 0,
			},
		});
	});

	it("should return 401 if user tries to view another user comment directly", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app)
			.get(`/comments/routesUser1/${comment.comment_id}`)
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 for anon users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app).get(
			`/comments/routesUser1/${comment.comment_id}`
		);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 for invalid comment id", async () => {
		const res = await request(app)
			.get(`/comments/routesUser2/2323`)
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(404);
	});

	it("returns 404 for invalid username", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app)
			.get(`/comments/nope/${comment.comment_id}`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** PATCH /comments/:username/:commentId */

describe("PATCH /comments/:username/:commentId", () => {
	test("works as expected for admin users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const update = {
			commentText: "updated u1 comment by admin",
		};
		const res = await request(app)
			.patch(`/comments/routesUser1/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			updated: "updated u1 comment by admin",
		});
	});

	test("works as expected for same user", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const update = {
			commentText: "updated u1 comment",
		};
		const res = await request(app)
			.patch(`/comments/routesUser1/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			updated: "updated u1 comment",
		});
	});

	it("returns 401 error if different user tries to update a comment", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const update = {
			commentText: "updated u1 comment",
		};

		const res = await request(app)
			.patch(`/comments/routesUser1/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 error for anon users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const update = {
			commentText: "updated u1 comment",
		};

		const res = await request(app)
			.patch(`/comments/routesUser1/${comment.comment_id}`)
			.send(update);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 400 error for invalid update data", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const update = {
			commentText: 1234,
		};
		const res = await request(app)
			.patch(`/comments/routesUser1/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 400 error for missing update data", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const update = {};
		const res = await request(app)
			.patch(`/comments/routesUser1/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 400 error for blank commentText field", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const update = {
			commentText: null,
		};
		const res = await request(app)
			.patch(`/comments/routesUser1/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 404 error for invalid username", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const update = {
			commentText: "updated u1 comment by admin",
		};
		const res = await request(app)
			.patch(`/comments/nope/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});

	it("returns 404 for invalid comment id", async () => {
		const res = await request(app)
			.patch(`/comments/routesUser1/999`)
			.send({ commentText: "updated u1 comment by admin" })
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** DELETE /comments/:username/:commentId */

describe("DELETE /comments/:username/:commentId", () => {
	test("route works as expected for admin users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app)
			.delete(`/comments/routesUser1/${comment.comment_id}`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			deleted: `${comment.comment_id}`,
		});
	});

	test("route works as expected for same username", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app)
			.delete(`/comments/routesUser1/${comment.comment_id}`)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			deleted: `${comment.comment_id}`,
		});
	});

	it("returns 401 if different user tries to delete a comment", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app)
			.delete(`/comments/routesUser/${comment.comment_id}`)
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 for anon users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app).delete(
			`/comments/routesUser1/${comment.comment_id}`
		);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 for invalid username", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app)
			.delete(`/comments/fails/${comment.comment_id}`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});

	it("returns 404 for invalid comment id", async () => {
		const res = await request(app)
			.delete(`/comments/routesUser1/9999`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});

	it("returns 404 if id has already been deleted", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		await request(app)
			.delete(`/comments/routesUser1/${comment.comment_id}`)
			.set("authorization", `Bearer ${adminToken}`);

		const res = await request(app)
			.delete(`/comments/routesUser1/${comment.comment_id}`)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});
});
