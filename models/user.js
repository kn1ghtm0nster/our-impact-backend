'use strict';

const db = require('../db');
const bcrypt = require('bcrypt');
const { sqlForPartialUpdate } = require('../helpers/sql');
const {
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
} = require('../expressError');
const { BCRYPT_WORK_FACTOR } = require('../config');

class User {
	/**
	 * Function registers new admin type user with object passed from req.body object.
	 *
	 * If username is already taken, return a BadRequestError
	 *
	 * @param {object}
	 * @returns {object} {username, firstName, lastName, email, userCity, isAdmin}
	 */
	static async registerNewAdmin({
		username,
		password,
		firstName,
		lastName,
		email,
		isAdmin,
	}) {
		const duplicateCheck = await db.query(
			`
			SELECT username FROM users
			WHERE username = $1
		`,
			[username]
		);

		if (duplicateCheck.rows[0])
			throw new BadRequestError(
				`Cannot create admin with duplicate username: ${username}`
			);

		const hashedPassword = await bcrypt.hash(password, 13);

		const newAdmin = await db.query(
			`
		INSERT INTO users(
			username,
			password,
			first_name,
			last_name,
			email,
			is_admin	
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING 
		username, 
		first_name AS "firstName", 
		last_name AS "lastName", 
		email, 
		city_name AS "userCity",
		is_admin AS "isAdmin"
		`,
			[username, hashedPassword, firstName, lastName, email, isAdmin]
		);

		const adminUser = newAdmin.rows[0];
		return adminUser;
	}

	/**
	 * Method to get admin type users from backend database only.
	 *
	 * @returns {array} [{username, firstName, lastName, email, cityName}, ...]
	 */

	static async getAdminUsers() {
		const users = await db.query(
			`
            SELECT
            username,
            first_name AS "firstName",
            last_name AS "lastName",
            email,
            city_name as "cityName"
            FROM users
			WHERE is_admin = TRUE
		`
		);

		return users.rows;
	}

	/**
	 * Register user with data received from JSON data.
	 *
	 * Returns {username, firstName, lastName, email, cityName}
	 *
	 * IF duplicate username is received, raises BadRequestError
	 *
	 */
	static async registerUser({
		username,
		password,
		firstName,
		lastName,
		email,
		userCity = null,
	}) {
		const duplicateCheck = await db.query(
			`SELECT username FROM users WHERE username = $1`,
			[username]
		);
		if (duplicateCheck.rows[0]) {
			throw new BadRequestError(`Duplicate username: ${username}`);
		}

		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

		const newUser = await db.query(
			`
            INSERT INTO users (
                username,
                password,
                first_name,
                last_name,
                email,
                city_name
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING username, first_name AS "firstName", last_name AS "lastName", email, city_name AS "userCity"
        `,
			[username, hashedPassword, firstName, lastName, email, userCity]
		);

		const user = newUser.rows[0];

		return user;
	}

	/**
	 * SQL query for ensuring that the username and password match backend.
	 *
	 * If username is not found, raise NotFoundError
	 *
	 * If password is not valid, raise UnauthorizedError
	 *
	 * @param {string} username
	 * @param {number} password
	 * @returns {void}
	 */
	static async authenticateUser(username, password) {
		const result = await db.query(
			`
            SELECT
            username,
            password,
            first_name as "firstName",
            last_name as "lastName",
            email,
            city_name as "userCity",
			is_admin as "isAdmin"
            FROM users
            WHERE username = $1
        `,
			[username]
		);

		const user = result.rows[0];

		if (!user) {
			throw new UnauthorizedError('Invalid username/password');
		}

		if (user) {
			const isValid = await bcrypt.compare(password, user.password);
			if (isValid === true) {
				delete user.password;
				return user;
			} else {
				throw new UnauthorizedError('Invalid username/password');
			}
		}
	}

	/**
	 *
	 * SQL query for getting a specific username from backend along with all their comments.
	 *
	 * @param {string} username
	 * @returns {object} {username, firstName, lastName, email, userCity, comments}
	 * 	WHERE comments = {id, text, cityName, likes} OR []
	 *
	 *
	 */

	static async getUser(username) {
		const requestedUser = await db.query(
			`
            SELECT
            username,
            first_name AS "firstName",
            last_name AS "lastName",
            email,
			city_name AS "userCity"
            FROM users
            WHERE username = $1
        `,
			[username]
		);

		const user = requestedUser.rows[0];

		if (!user) throw new NotFoundError(`No user found for: ${username}`);

		const comments = await db.query(
			`
			SELECT 
			comments.comment_id AS "id",
			comment_text AS "text",
			city_name AS "cityName",
			COUNT(likes.comment_id) AS "likes"
			FROM comments
			LEFT JOIN likes ON comments.comment_id = likes.comment_id
			WHERE comments.username = $1
			GROUP BY comments.comment_id
			ORDER BY likes DESC
		`,
			[username]
		);

		user.comments = comments.rows || [];

		return user;
	}

	/**
	 * SQL query for admin type users to view ALL users in database
	 *
	 * ONLY ADMINS CAN USE THIS QUERY.
	 *
	 * @returns {array} [{username, firstName, lastName, email, cityName}, ...]
	 */
	static async getAllUsers() {
		const users = await db.query(
			`
            SELECT
            username,
            first_name AS "firstName",
            last_name AS "lastName",
            email,
            city_name as "cityName"
            FROM users
		`
		);

		return users.rows;
	}

	/**
	 * SQL query updates a user profile based on the data object received from req.body and send data to backend db.
	 *
	 * If username is not found, raise NotFoundError
	 *
	 * Function returns the updated user profile object
	 *
	 * @param {string} username
	 * @param {object} data
	 * @returns {object} {updatedUser}
	 *
	 *
	 */
	static async updateUser(username, data) {
		if (data.password) {
			data.password = await bcrypt.hash(
				data.password,
				BCRYPT_WORK_FACTOR
			);
		}

		const { setCols, values } = sqlForPartialUpdate(data, {
			firstName: 'first_name',
			lastName: 'last_name',
			userCity: 'city_name',
		});

		const usernameVarIdx = '$' + (values.length + 1);

		const sqlQuery = `
            UPDATE users
            SET ${setCols}
            WHERE username = ${usernameVarIdx}
            RETURNING 
            username,
            first_name AS "firstName",
            last_name AS "lastName",
            email,
            city_name AS "userCity"
        `;

		const result = await db.query(sqlQuery, [...values, username]);

		const updatedUser = result.rows[0];
		if (!updatedUser)
			throw new NotFoundError(`Username: ${username} not found`);

		delete updatedUser.password;
		return updatedUser;
	}

	/**
	 *
	 * SQL query DELETES a given username from the backend database.
	 *
	 * If username is not found, raise NotFoundError
	 *
	 * @param {string} username
	 *
	 * @returns {void}
	 */
	static async deleteUser(username) {
		const result = await db.query(
			`
            DELETE FROM users
            WHERE username = $1
            RETURNING username
        `,
			[username]
		);

		const user = result.rows[0];

		if (!user) throw new NotFoundError(`Username: ${username} not found`);
	}
}

module.exports = User;
