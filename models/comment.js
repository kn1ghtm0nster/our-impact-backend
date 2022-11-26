"use-strict";

const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");

const { sqlForPartialUpdate } = require("../helpers/sql");

class Comment {
	/**
	 * SQL Query to get a specific comment for a city
	 *
	 * if comment id is not found then raise NotFoundError
	 *
	 * @param {number} id
	 * @returns {object} {id, comment, username, cityName, likes}
	 */

	static async getSingleCommentForCity(id) {
		const result = await db.query(
			`
			SELECT 
			comment_id AS "id",
			comment_text AS "comment",
			comments.username AS "username",
			city_name AS "cityName"
			FROM comments 
			WHERE comment_id = $1
		`,
			[id],
		);

		if (result.rows.length === 0)
			throw new NotFoundError(`comment not found with id: ${id}`);

		const likes = await db.query(
			`
			SELECT 
			comments.comment_id, COUNT(likes.comment_id) AS likes
			FROM likes
			LEFT JOIN comments ON comments.comment_id=likes.comment_id
			WHERE likes.comment_id = $1
			GROUP BY comments.comment_id
		`,
			[id],
		);

		const comment = result.rows[0];
		comment.likes = +likes.rows[0]?.likes || 0;

		return comment;
	}

	/**
	 * function retrieves comment information for a specific comment id.
	 *
	 * @param {number} id
	 *
	 * @returns {object} {id, comment, username, likes}
	 *
	 * If no comment found with id given raise BadRequestError
	 *
	 */
	static async getSingleComment(id) {
		// setup logic for getting a single comment for a specific id.
		const result = await db.query(
			`
			SELECT 
			comment_id AS "id",
			comment_text AS "comment",
			comments.username AS "username",
			city_name AS "cityName",
			likes 
			FROM comments
			WHERE comment_id = $1	
		`,
			[id],
		);

		const likes = await db.query(
			`
			SELECT 
			comments.comment_id, COUNT(likes.comment_id) AS likes
			FROM likes
			LEFT JOIN comments ON comments.comment_id=likes.comment_id
			WHERE likes.comment_id = $1
			GROUP BY comments.comment_id
		`,
			[id],
		);

		if (!result.rows[0])
			throw new NotFoundError(`comment id: ${id} not found`);

		const comment = result.rows[0];
		comment.likes = +likes.rows[0]?.likes || 0;

		return comment;
	}

	/**
	 * function adds a like to a given comment id
	 *
	 * @param {number} commentId
	 * @param {string} fromUsername
	 * @returns {object} {comment_id, likes}
	 *
	 * If commentId is not found, raise NotFoundError
	 */

	static async addLikeToComment(commentId, fromUsername) {
		// setup logic to add a like to a single comment.
		const commentCheck = await db.query(
			`
			SELECT comment_id, username
			FROM comments
			WHERE comment_id = $1
		`,
			[commentId],
		);

		if (!commentCheck.rows[0]) {
			throw new NotFoundError(`Comment id not found`);
		} else {
			const commentAuthor = commentCheck.rows[0].username;

			await db.query(
				`
				INSERT INTO likes (comment_id, username, from_username)
				VALUES ($1, $2, $3)
			`,
				[commentId, commentAuthor, fromUsername],
			);

			const likes = await db.query(`
				SELECT comments.comment_id, COUNT(likes.comment_id) AS likes
				FROM likes
				LEFT JOIN comments ON comments.comment_id=likes.comment_id
				GROUP BY comments.comment_id
			`);

			return likes.rows[0];
		}
	}

	/**
	 * function removes a like from a given comment id.
	 *
	 * @param {number} commentId
	 *
	 * @returns {void}
	 *
	 * If comment Id is not found, raise NotFoundError
	 */

	static async removeCommentLike(commentId) {
		const validCommentCheck = await db.query(
			`
			SELECT comment_id FROM likes
			WHERE comment_id = $1
		`,
			[commentId],
		);

		if (!validCommentCheck.rows[0])
			throw new NotFoundError(`Comment id not found`);

		await db.query(
			`
			DELETE FROM likes
			WHERE comment_id = $1
		`,
			[commentId],
		);
	}

	/**
	 * function retrieves ALL comments for a given username
	 *
	 * @param {string} username
	 *
	 * @returns {array} [{id, comment, username,cityName, likes},...]
	 *
	 * If username is invalid, raise NotFoundError
	 *
	 */

	static async getUserComments(username) {
		// check if username is valid in backend users table
		const userCheck = await db.query(
			`
			SELECT username
			FROM users
			WHERE username = $1
		`,
			[username],
		);

		if (!userCheck.rows[0])
			throw new NotFoundError(`Username : ${username} not found`);

		const result = await db.query(
			`
			SELECT 
			comments.comment_id AS "id",
			comment_text AS "comment",
			comments.username AS "username",
			city_name AS "cityName",
			COUNT(likes.comment_id) AS likes
			FROM comments
			LEFT JOIN likes ON comments.comment_id = likes.comment_id
			WHERE comments.username = $1
			GROUP BY comments.comment_id
			ORDER BY likes DESC
			
		`,
			[username],
		);

		const comments = result.rows;

		return comments;
	}

	/**
	 *
	 * function gets a SINGLE comment for a given username based on a comment id.
	 *
	 * @param {string} username
	 * @param {number} commentId
	 * @returns {object} {id, comment, username, cityName, likes}
	 *
	 * If either commentId or username are not found, raise NotFoundError
	 */

	static async getSingleUserComment(username, commentId) {
		const userCheck = await db.query(
			`
			SELECT username
			FROM users
			WHERE username = $1
		`,
			[username],
		);

		if (!userCheck.rows[0])
			throw new NotFoundError(`Username : ${username} not found`);

		const commentCheck = await db.query(
			`
			SELECT comment_id 
			FROM comments 
			WHERE comment_id = $1
		`,
			[commentId],
		);

		if (!commentCheck.rows[0]) throw new NotFoundError(`Comment not found`);

		const result = await db.query(
			`
			SELECT 
			comment_id AS "id",
			comment_text AS "comment",
			comments.username AS "username",
			city_name AS "cityName",
			likes 
			FROM comments
			WHERE comment_id = $1
		`,
			[commentId],
		);

		const likes = await db.query(
			`
			SELECT 
			comments.comment_id, COUNT(likes.comment_id) AS likes
			FROM likes
			LEFT JOIN comments ON comments.comment_id=likes.comment_id
			WHERE likes.comment_id = $1
			GROUP BY comments.comment_id
		`,
			[commentId],
		);

		const comment = result.rows[0];
		comment.likes = +likes.rows[0]?.likes || 0;

		return comment;
	}

	/**
	 * Updates the text of a given comment id
	 *
	 * @param {number} id
	 * @param {object} data
	 * @returns {object} {comment}
	 *
	 */

	static async updateComment(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {
			commentText: "comment_text",
		});

		const varIdx = "$" + (values.length + 1);

		const sqlQuery = `
		UPDATE comments
		SET ${setCols}
		WHERE comment_id = ${varIdx}
		RETURNING comment_text AS "commentText"
		`;

		const result = await db.query(sqlQuery, [...values, id]);

		const comment = result.rows[0];

		return comment;
	}

	/**
	 * function deletes a comment id from the backend database.
	 *
	 * @param {number} id
	 *
	 * @returns {number} {id}
	 *
	 * function removes a like from the backend likes table for a given comment id. If the comment id is not found, raise NotFoundError.
	 */

	static async deleteComment(id) {
		// setup logic to delete a comment based on ID passed in.

		const result = await db.query(
			`
			DELETE FROM comments
			WHERE comment_id = $1
			RETURNING comment_id AS "id"
		`,
			[id],
		);

		const comment = result.rows[0];

		if (!comment) throw new NotFoundError(`Comment id not found`);
	}
}

// TODO: Add check for likes method to prevent the same user from liking a comment twice without first removing the like.

module.exports = Comment;
