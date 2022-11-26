"use strict";

const {
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
} = require("../expressError");

const db = require("../db.js");
const User = require("./user.js");

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

/****************AUTHENTICATE TESTS*********************/

describe("testing authenticate class method on User", () => {
	it("should work as intended", async function () {
		const user = await User.authenticateUser("user#1", "password1");

		expect(user).toEqual({
			username: "user#1",
			firstName: "user1First",
			lastName: "user1Last",
			email: "user1@email.com",
			userCity: "Dallas",
			isAdmin: false,
		});
	});

	it("throws UnauthorizedError if no such user", async function () {
		try {
			await User.authenticateUser("supermannohere", "password");
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});

	it("throws UnauthorizedError if password is invalid", async function () {
		try {
			await User.authenticateUser("user#2", "disbadpassword");
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});
});

/****************REGISTER TESTS*********************/

describe("reisterUser/registerNewAdmin tests", () => {
	const newUser = {
		username: "new",
		firstName: "Test",
		lastName: "Tester",
		email: "test@test.com",
	};
	it("works as expected", async function () {
		let user = await User.registerUser({
			...newUser,
			password: "password111`",
		});

		expect(user).toEqual({
			username: "new",
			firstName: "Test",
			lastName: "Tester",
			email: "test@test.com",
			userCity: null,
		});

		const found = await db.query(`
            SELECT * FROM
            users
            WHERE username = 'new'
        `);

		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_admin).toEqual(false);
	});

	test("registerNewAdmin works as expected", async function () {
		const newAdmin = await User.registerNewAdmin({
			...newUser,
			password: "adminpassword",
			isAdmin: true,
		});

		expect(newAdmin).toEqual({
			username: "new",
			firstName: "Test",
			lastName: "Tester",
			email: "test@test.com",
			userCity: null,
			isAdmin: true,
		});

		const found = await db.query(
			"SELECT * FROM users WHERE username = 'new'"
		);
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_admin).toEqual(true);
	});

	test("BadRequestError for duplicate usernames", async function () {
		try {
			await User.registerUser({
				...newUser,
				password: "password",
			});
			await User.registerUser({
				...newUser,
				password: "password",
			});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});

	test("BadRequestError for duplicate admin username", async function () {
		try {
			await User.registerNewAdmin({
				...newUser,
				password: "adminpassword",
				isAdmin: true,
			});
			await User.registerNewAdmin({
				...newUser,
				password: "adminpassword",
				isAdmin: true,
			});
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

/****************GETALLUSER TESTS*********************/

describe("getAllUsers tests", () => {
	it("gets all users form backend table", async function () {
		const users = await User.getAllUsers();

		expect(users.length).toBeTruthy();
		expect(users.length).toBe(2);
	});
});

/****************GETADMINUSERS TESTS*********************/
describe("getAdminUsers", function () {
	const newAdmin = {
		username: "newAdmin",
		firstName: "new",
		lastName: "Admin",
		email: "newAdmin@test.com",
	};
	it("works as expected", async () => {
		await User.registerNewAdmin({
			...newAdmin,
			password: "adminpassword",
			isAdmin: true,
		});

		const admins = await User.getAdminUsers(newAdmin.username);

		expect(admins.length).toBe(1);
		expect(admins).toEqual([
			{
				cityName: null,
				email: "newAdmin@test.com",
				firstName: "new",
				lastName: "Admin",
				username: "newAdmin",
			},
		]);
	});
});

/****************GETUSER TESTS*********************/
describe("getUser tests", () => {
	it("works as expected", async () => {
		const user = await User.getUser("user#1");

		expect(user).toEqual({
			username: "user#1",
			firstName: "user1First",
			lastName: "user1Last",
			email: "user1@email.com",
			userCity: "Dallas",
			comments: [
				{
					cityName: "Paris",
					id: expect.any(Number),
					likes: "0",
					text: "This is a comment from u1",
				},
			],
		});
	});

	it("throws NotFoundError username is not found in db", async () => {
		expect.assertions(1);

		try {
			await User.getUser("nope");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************UPDATEUSER TESTS*********************/
describe("updateUser tests", () => {
	it("works as expected", async () => {
		expect.assertions(1);
		const data = {
			firstName: "updatedU1",
			lastName: "lastNameUpdated",
			userCity: "Paris",
		};
		const userUpdate = await User.updateUser("user#1", data);

		expect(userUpdate).toEqual({
			username: "user#1",
			firstName: "updatedU1",
			lastName: "lastNameUpdated",
			email: "user1@email.com",
			userCity: "Paris",
		});
	});

	it("throws NotFoundError when username not in backend db", async () => {
		expect.assertions(1);
		const data = {
			firstName: "updatedU1",
			lastName: "lastNameUpdated",
			userCity: "Paris",
		};

		try {
			await User.updateUser("thisusernothere", data);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/****************DELETEUSER TESTS*********************/
describe("deleteUser tests", () => {
	it("works as expected", async () => {
		await User.deleteUser("user#2");

		const query = await User.getAllUsers();

		expect(query.length).toBe(1);

		try {
			await User.getUser("user#2");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	it("throws NotFoundError if user does not exist", async () => {
		expect.assertions(1);

		try {
			await User.deleteUser("doesntwork");
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
