"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");

const db = require("../db.js");
const City = require("./city");
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

/****************GETALLCITIES TESTS*********************/

describe("getAllCities tests", () => {
	it("works as expected and returns all cities", async () => {
		expect.assertions(1);
		const allCities = await City.getAllCities();

		expect(allCities.length).toEqual(20);
	});
});

/****************GETCITY TESTS*********************/
describe("getCity tests", () => {
	it("works as expected", async () => {
		expect.assertions(1);

		const dallas = await City.getCity("Dallas");

		expect(dallas).toEqual({
			city_name: "Dallas",
			country_code: "US",
			lat: 32.7762719,
			lon: -96.7968559,
		});
	});

	it("throws NotFoundError if city not in db", async () => {
		expect.assertions(1);

		try {
			await City.getCity("Fort Worth");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************GETCITYCOMMENTS TESTS*********************/

describe("getCityComments tests", () => {
	it("should work as expected", async () => {
		expect.assertions(1);
		const parisComments = await City.getCityComments("Paris");

		expect(parisComments).toEqual({
			city_name: "Paris",
			country_code: "FR",
			lat: 48.8588897,
			lon: 2.3200410217200766,
			comments: [
				{
					cityName: "Paris",
					comment: "This is a comment from u1",
					id: expect.any(Number),
					likes: "0",
					username: "user#1",
				},
			],
		});
	});

	it("throws NotFoundError if city not in db", async () => {
		expect.assertions(1);

		try {
			await City.getCityComments("Washington DC");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************ADDNEWCOMMENT TESTS*********************/

describe("addNewComment tests", () => {
	it("works as expected", async () => {
		expect.assertions(1);
		const commentObject = {
			commentText: "comment from user#1",
			author: "user#1",
			locationName: "Paris",
		};
		const newComment = await City.addNewComment({ ...commentObject });

		expect(newComment).toEqual({
			comment_id: expect.any(Number),
			comment: "comment from user#1",
			username: "user#1",
			cityName: "Paris",
			likes: 0,
		});
	});

	it("throws BadRequestError for invalid city name", async () => {
		expect.assertions(1);
		const commentObject = {
			commentText: "comment from user#1",
			author: "user#1",
			locationName: "InvalidCity",
		};
		try {
			await City.addNewComment({ ...commentObject });
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});

	it("throws BadRequestError for invalid usernames", async () => {
		expect.assertions(1);
		const commentObject = {
			commentText: "comment from user#1",
			author: "InvalidUsername",
			locationName: "Paris",
		};

		try {
			await City.addNewComment({ ...commentObject });
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/****************UPDATECOMMENT TESTS*********************/
describe("updateComment tests", () => {
	test("works as expected", async function () {
		let allComms = await Comment.getUserComments("user#1");
		let commentToUpdate = allComms;
		const updateData = { commentText: "updating user#1 comment" };
		const comment = await City.updateComment(commentToUpdate[0].id, {
			...updateData,
		});

		expect(comment).toEqual({
			commentText: "updating user#1 comment",
		});
	});

	it("throws NotFoundError if comment id is not in coments db", async () => {
		const updateData = { commentText: "updating user#1 comment" };
		try {
			await City.updateComment(444, { ...updateData });
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************DELETECOMMENT TESTS*********************/
describe("deleteComment tests", () => {
	it("works as expected", async () => {
		let allComms = await Comment.getUserComments("user#2");
		let commentToRemove = allComms[0].id;
		await City.deleteComment(commentToRemove);
		const dallasComments = await City.getCityComments("Dallas");
		expect(dallasComments.comments.length).toBe(0);
	});

	it("throws NotFoundError if id not in comments table", async () => {
		try {
			await City.deleteComment(3434);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
