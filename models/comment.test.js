"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Comment = require("./comment");
const User = require("./user");

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

/****************GETSINGLECOMMENTFORCITY TESTS*********************/
describe("getSingleCommentForCity", () => {
	it("works as expected", async () => {
		let allComms = await Comment.getUserComments("user#1");
		let commentId = allComms[0].id;

		const cityComment = await Comment.getSingleCommentForCity(commentId);

		expect(cityComment).toEqual({
			id: expect.any(Number),
			comment: "This is a comment from u1",
			username: "user#1",
			cityName: "Paris",
			likes: 0,
		});
	});

	it("throws NotFoundError if invalid id is provided", async () => {
		try {
			await Comment.getSingleCommentForCity(9999);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************GETSINGLECOMMENT TESTS*********************/
describe("getSingleComment tests", () => {
	it("works as expected", async () => {
		let allComms = await Comment.getUserComments("user#1");
		let commentId = allComms[0].id;

		const comment = await Comment.getSingleComment(commentId);

		expect(comment).toEqual({
			id: expect.any(Number),
			comment: "This is a comment from u1",
			username: "user#1",
			cityName: "Paris",
			likes: 0,
		});
	});

	it("throws NotFoundError if id is invalid", async () => {
		try {
			await Comment.getSingleComment(9999);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************ADDLIKETOCOMMENT TESTS*********************/
describe("addLikeToComment", () => {
	it("should work as expected", async () => {
		let comment = await Comment.getUserComments("user#1");
		const targetId = comment[0].id;

		const likedComment = await Comment.addLikeToComment(targetId);

		expect(likedComment).toEqual({
			comment_id: expect.any(Number),
			likes: "1",
		});
	});

	it("throws NotFoundError for invalid id", async () => {
		try {
			await Comment.addLikeToComment(9999);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************REMOVECOMMENTLIKES TESTS*********************/
describe("removeCommentLike tests", () => {
	it("should work as expected", async () => {
		let comment = await Comment.getUserComments("user#1");
		const targetId = comment[0].id;
		await Comment.addLikeToComment(targetId);

		await Comment.removeCommentLike(targetId);

		const noLikes = await Comment.getSingleComment(targetId);

		expect(noLikes).toEqual({
			id: expect.any(Number),
			comment: "This is a comment from u1",
			username: "user#1",
			likes: 0,
			cityName: "Paris",
		});
	});

	it("throws NotFoundError for invalid id", async () => {
		try {
			await Comment.removeCommentLike(12345);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************GETUSERCOMMENTS TESTS*********************/
describe("getUserComments tests", () => {
	it("works as expected", async () => {
		const response = await Comment.getUserComments("user#1");

		expect(response).toEqual([
			{
				id: expect.any(Number),
				comment: "This is a comment from u1",
				username: "user#1",
				cityName: "Paris",
				likes: "0",
			},
		]);
	});

	it("throws NotFoundError for invalid username", async () => {
		try {
			await Comment.getUserComments("Rene Quintanilla");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************GETSINGLEUSERCOMMENT TESTS*********************/
describe("getSingleUserComment tests", () => {
	it("works as expected", async () => {
		let comment = await Comment.getUserComments("user#1");
		const targetId = comment[0].id;

		const singleComment = await Comment.getSingleUserComment(
			"user#1",
			targetId
		);

		expect(singleComment).toEqual({
			id: expect.any(Number),
			comment: "This is a comment from u1",
			username: "user#1",
			cityName: "Paris",
			likes: 0,
		});
	});

	it("throws NotFoundError for invalid usernames", async () => {
		let comment = await Comment.getUserComments("user#1");
		const targetId = comment[0].id;
		try {
			await Comment.getSingleUserComment("invalid", targetId);
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************UPDATEUSERCOMMENT TESTS*********************/
describe("updateComment tests", () => {
	it("works as expected", async () => {
		let comment = await Comment.getUserComments("user#2");
		const targetId = comment[0].id;
		const data = {
			commentText: "updated comment for u2",
		};

		const updated = await Comment.updateComment(targetId, data);

		expect(updated).toEqual({
			commentText: "updated comment for u2",
		});
	});
});

/****************DELETECOMMENT TESTS*********************/
describe("deleteComment tests", () => {
	it("works as expected", async () => {
		let comment = await Comment.getUserComments("user#2");
		const targetId = comment[0].id;

		await Comment.deleteComment(targetId);

		const updated = await Comment.getUserComments("user#2");
		expect(updated).toEqual([]);
	});

	it("throws NotFoundError if invalid id is provided", async () => {
		try {
			await Comment.deleteComment(4545);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
