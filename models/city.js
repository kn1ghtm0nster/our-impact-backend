"use-strict";

const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");

const { sqlForPartialUpdate } = require("../helpers/sql");

class City {
	/**
	 *
	 * @returns [{city_name, country_code, lat, lon}, ...]
	 */
	static async getAllCities() {
		let query = `SELECT city_name, country_code, lattitude AS "lat", longitude AS "lon" FROM cities`;

		const citiesRes = await db.query(query);
		return citiesRes.rows;
	}

	/**
	 *
	 * @param {string} cityName
	 * @returns {object} {city_name, country_code, lat, lon}
	 */

	static async getCity(cityName) {
		const cityRes = await db.query(
			`SELECT city_name, country_code, lattitude AS "lat", longitude AS "lon" FROM cities WHERE city_name = $1`,
			[cityName],
		);

		const city = cityRes.rows[0];
		if (!city) {
			throw new NotFoundError(`City not found: ${cityName}`);
		}

		return city;
	}

	/**
	 *
	 * SQL query to get the list of comments for a given city name.
	 *
	 * if the city name does NOT exist in cities table, then raise NotFoundError
	 *
	 * @param {string} cityName
	 *
	 * @returns {object} {city_name, country_code, lat, lon, comments}
	 *
	 * WHERE comments = [{id, comment, username, cityName, likes}, ...]
	 *
	 */

	static async getCityComments(cityName) {
		const cityRes = await db.query(
			`SELECT city_name, country_code, lattitude AS "lat", longitude AS "lon" FROM cities WHERE city_name = $1`,
			[cityName],
		);

		const city = cityRes.rows[0];
		if (!city) {
			throw new NotFoundError(`City not found: ${cityName}`);
		}

		const comments = await db.query(
			`
            SELECT 
			comments.comment_id AS "id", 
			comment_text AS "comment", 
			comments.username AS "username", 
			city_name AS "cityName",
			COUNT(likes.comment_id) AS likes
			FROM comments
			LEFT JOIN likes ON comments.comment_id = likes.comment_id
			WHERE comments.city_name = $1
			GROUP BY comments.comment_id
			ORDER BY likes DESC
        `,
			[cityName],
		);
		city.comments = comments.rows;

		return city;
	}

	/**
	 * SQL query to add a new comment for a given city and username.
	 *
	 * if username does NOT exist, raise BadRequestError
	 *
	 * if city is not in cities table, raise BadRequestError
	 *
	 * RETURNS {comment_id, comment, username, cityName, likes}
	 *
	 *	@param {object} {commentText, author, locationName}
	 * @returns {object} {comment_id, comment, username, cityName, likes}
	 */
	static async addNewComment({ commentText, author, locationName }) {
		// check if locationName (city_name) is valid from current cities table and if not then return BadRequestError
		const cityCheck = await db.query(
			`
			SELECT *
			FROM cities
			WHERE city_name = $1
		`,
			[locationName],
		);

		if (!cityCheck.rows[0]) {
			throw new BadRequestError(`Invalid city name: ${locationName}`);
		}

		// check if author (username) is listed current users table and if not then return BadRequestError
		const userCheck = await db.query(
			`
			SELECT *
			FROM users
			WHERE username = $1
		`,
			[author],
		);

		if (!userCheck.rows[0])
			throw new BadRequestError(`Invalid username: ${author}`);

		// query for adding new comment to cities table.
		const sqlQuery = `
			INSERT INTO comments (comment_text, username, city_name)
			VALUES ($1, $2, $3)
			RETURNING comment_id, comment_text AS "comment", username, city_name AS "cityName", likes
		`;

		const result = await db.query(sqlQuery, [
			commentText,
			author,
			locationName,
		]);
		return result.rows[0];
	}

	/**
	 * SQL query for updating a comment ID with the data object passed in.
	 *
	 * RETURNS {commentText : "string"}
	 *
	 * If id is not found, raise NotFoundError.
	 *
	 * @param {number} commentId
	 *
	 * @param {object} data
	 *
	 * @returns {string} commentText
	 */

	static async updateComment(commentId, data) {
		const validComment = await db.query(
			`
			SELECT comment_id
			FROM comments
			WHERE comment_id = $1
		`,
			[commentId],
		);

		if (!validComment.rows[0]) {
			throw new NotFoundError(`Comment not found with id: ${commentId}`);
		}

		const { setCols, values } = sqlForPartialUpdate(data, {
			commentText: "comment_text",
		});

		const varIdx = "$" + (values.length + 1);

		const sqlQuery = `
			UPDATE comments
            SET ${setCols}
			WHERE comments.comment_id = ${varIdx}
			RETURNING comment_text AS "commentText"
		`;

		const result = await db.query(sqlQuery, [...values, commentId]);

		const comment = result.rows[0];

		return comment;
	}

	/**
	 * SQL Query to delete a comment.
	 *
	 * THIS FUNCTION DOES NOT RETURN ANY VALUES.
	 *
	 * if comment not found, NotFoundError is raised
	 *
	 * @param {Number} commentId
	 *
	 *
	 * @returns {Void}
	 */

	static async deleteComment(commentId) {
		const result = await db.query(
			`
			DELETE FROM comments
			WHERE comment_id = $1
			RETURNING comment_id AS "id"
		`,
			[commentId],
		);

		const comment = result.rows[0];

		if (!comment) throw new NotFoundError(`Comment id not found`);
	}
}

module.exports = City;
