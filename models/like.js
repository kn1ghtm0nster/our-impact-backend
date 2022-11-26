"use strict";

const db = require("../db");

const { NotFoundError } = require("../expressError");

// Class to pull all likes from backend db to show on frontend ONLY.
class Likes {
	/**
	 * Main query for getting all likes from the backend db.
	 *
	 * THIS WILL ONLY BE USED BY FRONTEND ROUTES AND IS FOR ADMINS ONLY.
	 *
	 * @returns {array} [{id, commentId, username, fromUser}, ...]
	 */
	static async getAllLikes() {
		const res = await db.query(`
            SELECT
            id,
            comment_id AS "commentId",
            username,
			from_username AS "fromUser"
            FROM
            likes
        `);

		return res.rows;
	}

	/**
	 * Main query for getting all likes from a specific username sent from frontend.
	 *
	 * If username is not found in db, throw NotFoundError.
	 *
	 * @param {string} username
	 * @returns {array} [{id, commentId, fromUser}, ...]
	 */
	static async getLikesForUser(username) {
		const userCheck = await db.query(
			`SELECT
            username
            FROM 
            users
            WHERE username = $1
            `,
			[username],
		);

		if (!userCheck.rows[0])
			throw new NotFoundError(`Username : ${username} not found`);

		const userLikes = await db.query(
			`
            SELECT
            id,
            comment_id AS "commentId",
            from_username AS "fromUser"
            FROM
            likes
            WHERE from_username = $1
        `,
			[username],
		);

		return userLikes.rows;
	}
}

module.exports = Likes;
