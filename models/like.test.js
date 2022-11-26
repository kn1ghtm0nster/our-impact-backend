// TODO: implement tets for model file.
"use strict";

const db = require("../db");

const { NotFoundError } = require("../expressError");
const Likes = require("./like");
const Comment = require("./comment");

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

/****************GETALLLIKES TESTS*********************/

describe("getAllLikes tests", () => {
	it("works as expected", async () => {
		const res = await Likes.getAllLikes();
		expect(res.length).toEqual(0);
	});
});

/****************GETLIKESFORUSER TESTS*********************/

describe("getLikesForUser", () => {
	it("works as expected", async () => {
		const targetComment = await Comment.getUserComments("user#1");
		const id = targetComment[0].id;
		await Comment.addLikeToComment(id, "user#2");

		const res = await Likes.getLikesForUser("user#2");

		expect(res).toEqual([
			{
				id: expect.any(Number),
				commentId: expect.any(Number),
				fromUser: "user#2",
			},
		]);
	});

	it("throws notFoundError for indvalid username", async () => {
		try {
			await Likes.getLikesForUser("nope");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
