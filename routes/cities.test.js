const request = require('supertest');

const db = require('../db.js');
const app = require('../app');
const City = require('../models/city');

const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	u2Token,
	adminToken,
} = require('./_setupForTests');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /cities */

describe('GET /cities', () => {
	test('route works as expected', async () => {
		const res = await request(app).get('/cities');

		expect(res.statusCode).toEqual(200);
		expect(res.body.cities.length).toEqual(20);
	});
});

/************************************** GET /cities/:name */

describe('GET /cities/:name', () => {
	test('route works as expected', async () => {
		const res = await request(app).get('/cities/Dallas');

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			city: {
				city_name: 'Dallas',
				country_code: 'US',
				lat: expect.any(Number),
				lon: expect.any(Number),
			},
		});
	});

	it('returns 404 error if city not found', async () => {
		const res = await request(app).get('/cities/nahcuh');

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** GET /cities/:name/comments */

describe('GET /cities/:name/comments', () => {
	test('route works as expected', async () => {
		const res = await request(app)
			.get('/cities/Dallas/comments')
			.set('authorization', `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			cityData: {
				city_name: 'Dallas',
				country_code: 'US',
				lat: expect.any(Number),
				lon: expect.any(Number),
				comments: [],
			},
		});
	});

	it('returns 401 error for anon users', async () => {
		const res = await request(app).get('/cities/Dallas/comments');

		expect(res.statusCode).toEqual(401);
	});

	it('retrns 404 error invalid city name', async () => {
		const res = await request(app)
			.get('/cities/nope/comments')
			.set('authorization', `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** GET /cities/:name/comments/:id */

describe('GET /cities/:name/comments/:id', () => {
	test('route works as expected', async () => {


		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)

		const res = await request(app)
			.get(`/cities/Dallas/comments/${comment.comment_id}`)
			.set('authorization', `${u1Token}`);

		expect(res.statusCode).toEqual(200);
	});

	it('returns 401 error for anon users', async () => {
		const data = {
			commentText: 'routes comment for u2',
			author: 'routesUser2',
			locationName: 'Paris',
		};
		const secondComment = await request(app)
			.post('/cities/Dallas/comments/new')
			.send(data)
			.set('authorization', `Bearer ${u2Token}`);
		const res = await request(app).get(
			`/cities/Paris/comments/${secondComment.id}`,
		);

		expect(res.statusCode).toEqual(401);
	});

	it('returns 404 for invalid comment id', async () => {
		const res = await request(app)
			.get('/cities/Paris/comments/99999')
			.set('authorization', `${u1Token}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** GET /cities/:name/comments/new */

describe("POST /cities/:name/comments/new", () => {
	test("route works as expected", async () => {
		const commentData = {
			commentText: "new comment for u1",
			author: "routesUser1",
			locationName: "Perth",
		};
		const res = await request(app)
			.post("/cities/Perth/comments/new")
			.send(commentData)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(201);
		expect(res.body).toEqual({
			comment: {
				comment_id: expect.any(Number),
				comment: "new comment for u1",
				username: "routesUser1",
				cityName: "Perth",
				likes: 0,
			},
		});
	});

	it("returns 401 for anon users", async () => {
		const commentData = {
			commentText: "new comment for u1",
			author: "routesUser1",
			locationName: "Perth",
		};

		const res = await request(app)
			.post("/cities/Perth/comments/new")
			.send(commentData);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 for invalid city in url params", async () => {
		const commentData = {
			commentText: "new comment for u1",
			author: "routesUser1",
			locationName: "Perth",
		};

		const res = await request(app)
			.post("/cities/thisshouldfail/comments/new")
			.send(commentData)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(404);
	});

	it("returns 400 for invalid city in comment data", async () => {
		const commentData = {
			commentText: "new comment for u1",
			author: "routesUser1",
			locationName: "thisshouldfail",
		};

		const res = await request(app)
			.post("/cities/Perth/comments/new")
			.send(commentData)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 400 error for missing comment data", async () => {
		const commentData = {
			commentText: "new comment for u1",
			author: "routesUser1",
		};

		const res = await request(app)
			.post("/cities/Perth/comments/new")
			.send(commentData)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 400 error for invalid data type in comment data", async () => {
		const commentData = {
			commentText: "new comment for u1",
			author: false,
			locationName: "Perth",
		};

		const res = await request(app)
			.post("/cities/Perth/comments/new")
			.send(commentData)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(400);
	});
});

/************************************** PATCH /cities/:name/:username/comments/edit/:id */

describe("PATCH /cities/:name/:username/comments/edit/:id", () => {
	test("works as expected for admin users", async () => {

		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)

		const update = {
			commentText: "updated comment for u2",
		};

		const res = await request(app)
			.patch(`/cities/Paris/routesUser2/comments/edit/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			updated: "updated comment for u2",
		});
	});

	test("works as expected for same user", async () => {

		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser1",
				locationName: "Perth"
			}
		)

		const update = {
			commentText: "updated comment for u1",
		};

		const res = await request(app)
			.patch(`/cities/Perth/routesUser1/comments/edit/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			updated: "updated comment for u1",
		});
	});

	it("returns 401 for non-admin users trying to update other user comments", async () => {

		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "London"
			}
		)

		const update = {
			commentText: "this should fail",
		};

		const res = await request(app)
			.patch(`/cities/London/routesUser1/comments/edit/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 for anon users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "London"
			}
		)

		const update = {
			commentText: "this should fail",
		};

		const res = await request(app)
			.patch(`/cities/London/routesUser1/comments/edit/${comment.comment_id}`)
			.send(update);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 400 for invalid data in update object", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "London"
			}
		)

		const update = {
			commentText: 12,
		};

		const res = await request(app)
			.patch(`/cities/London/routesUser1/comments/edit/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 400 for missing data in update object", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "London"
			}
		)

		const update = {};

		const res = await request(app)
			.patch(`/cities/London/routesUser1/comments/edit/${comment.comment_id}`)
			.send(update)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(400);
	});

	it("returns 404 error for invalid comment id", async () => {
		const update = {
			commentText: "this should fail",
		};

		const res = await request(app)
			.patch(`/cities/Dallas/routesUser2/comments/edit/191919191`)
			.send(update)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});
});

/************************************** DELETE /cities/:name/:username/comments/delete/:id */

describe("DELETE /cities/:name/:username/comments/delete/:id", () => {
	test("route works as expected for admin users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)

		const res = await request(app)
			.delete(
				`/cities/Paris/routesUser2/comments/delete/${comment.comment_id}`
			)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({ deleted: expect.any(String) });
	});

	test("route works as expected for same user", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Dallas"
			}
		)
		const res = await request(app)
			.delete(
				`/cities/Dallas/routesUser1/comments/delete/${comment.comment_id}`
			)
			.set("authorization", `Bearer ${u1Token}`);

		expect(res.statusCode).toEqual(200);
		expect(res.body).toEqual({
			deleted: expect.any(String),
		});
	});

	it("returns 401 error for anon users", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser2",
				author: "routesUser2",
				locationName: "Paris"
			}
		)
		const res = await request(app).delete(
			`/cities/Paris/routesUser2/comments/delete/${comment.comment_id}`
		);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 401 for users trying to delete a comment for another user", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Perth"
			}
		)
		const res = await request(app)
			.delete(
				`/cities/Perth/routesUser1/comments/delete/${comment.comment_id}`
			)
			.set("authorization", `Bearer ${u2Token}`);

		expect(res.statusCode).toEqual(401);
	});

	it("returns 404 error for invalid id", async () => {
		const res = await request(app)
			.delete(`/cities/Dallas/routesUser2/comments/delete/404004`)
			.set("authorization", `Bearer ${adminToken}`);
		expect(res.statusCode).toEqual(404);
	});

	it("returns 404 error if id already deleted", async () => {
		const comment = await City.addNewComment(
			{
				commentText: "comment from routesUser1",
				author: "routesUser1",
				locationName: "Paris"
			}
		)
		await request(app)
			.delete(
				`/cities/Paris/routesUser1/comments/delete/${comment.comment_id}`
			)
			.set("authorization", `Bearer ${adminToken}`);

		const res = await request(app)
			.delete(
				`/cities/Paris/routesUser1/comments/delete/${comment.comment_id}`
			)
			.set("authorization", `Bearer ${adminToken}`);

		expect(res.statusCode).toEqual(404);
	});
});
