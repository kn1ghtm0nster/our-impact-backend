"use strict";

const db = require("../db");

const { NotFoundError } = require("../expressError");

class Resources {
	/**
	 * Main query method to get all resources from backend db.
	 *
	 * @returns {array} [{id, title, url, type, rating}, ...]
	 */
	static async getAllResources() {
		const data = await db.query(`
            SELECT 
            resource_id AS "id",
            content_title AS "title",
            content_url AS "url",
            content_type AS "type",
            rating
            FROM
            resources
        `);

		return data.rows;
	}

	/**
	 * Method to get a single resource from the database.
	 *
	 * If id not found, raise NotFoundError.
	 *
	 * @param {number} id
	 * @returns {object} {id, title, url, type, rating}
	 */
	static async getSingleResource(id) {
		const resource = await db.query(
			`
            SELECT 
            resource_id AS "id",
            content_title AS "title",
            content_url AS "url",
            content_type AS "type",
            rating
            FROM
            resources
            WHERE resource_id = $1
        `,
			[id],
		);

		if (!resource.rows[0])
			throw new NotFoundError(`resource id ${id} not found`);

		return resource.rows[0];
	}

	/**
	 *
	 * Method to get all Article type resources from backend db.
	 *
	 * @returns {array} [{id, title, url, type, rating}, ...]
	 *
	 */
	static async getAllArticles() {
		const articles = await db.query(`
            SELECT
            resource_id AS "id",
            content_title AS "title",
            content_url AS "URL",
            content_type AS "type",
            rating
            FROM
            resources
            WHERE content_type = 'Article'
        `);

		return articles.rows;
	}

	/**
	 * Method to get all Video type resources from backend db.
	 *
	 * @returns {array} [{id, title, url, type, rating}, ...]
	 *
	 */
	static async getAllVideos() {
		const videos = await db.query(`
            SELECT
            resource_id AS "id",
            content_title AS "title",
            content_url AS "URL",
            content_type AS "type",
            rating
            FROM
            resources
            WHERE content_type = 'Video'
        `);

		return videos.rows;
	}

	/**
	 * Method to get all Landing Page type resources from backend db.
	 *
	 * @returns {array} [{id, title, url, type, rating}, ...]
	 *
	 */
	static async getLandingPages() {
		const landingPages = await db.query(`
            SELECT
            resource_id AS "id",
            content_title AS "title",
            content_url AS "URL",
            content_type AS "type",
            rating
            FROM
            resources
            WHERE content_type = 'Landing Page'
        `);

		return landingPages.rows;
	}

	/**
	 * Method to add a new resource to backend db.
	 *
	 * THIS WILL BE USED BY ADMIN TYPE USERS ONLY.
	 *
	 * @param {object} content_title
	 * @param {object} content_url
	 * @param {object} content_type
	 * @param {object} rating
	 * @returns {object} {id, title, url, type, rating}
	 *
	 */
	static async addNewResource({
		content_title,
		content_url,
		content_type,
		rating,
	}) {
		const result = await db.query(
			`
            INSERT INTO resources (content_title, content_url, content_type, rating)
            VALUES ($1, $2, $3, $4)
            RETURNING resource_id AS "id", content_title AS "title", content_url AS "url", content_type AS "type", rating        
        `,
			[content_title, content_url, content_type, rating],
		);

		return result.rows[0];
	}

	/**
	 * Method to update a resource within backend db.
	 *
	 * THIS WILL BE USED BY ADMIN TYPE USERS ONLY.
	 *
	 * if id not found, raise NotFoundError.
	 *
	 * @param {number} id
	 * @param {object} data
	 * @returns {object} {id, title, url, type, rating}
	 *
	 */
	static async updateResource(id, data) {
		const validResource = await db.query(
			`
            SELECT resource_id FROM resources WHERE resource_id = $1
        `,
			[id],
		);

		if (!validResource.rows[0]) throw new NotFoundError("Id not found");

		const updatedResource = await db.query(
			`
            UPDATE resources
            SET content_title = $1, content_url = $2, content_type = $3, rating = $4
            WHERE resource_id = $5
            RETURNING resource_id AS "id", content_title AS "title", content_url AS "url", content_type AS "type", rating
        `,
			[
				data.content_title,
				data.content_url,
				data.content_type,
				data.rating,
				id,
			],
		);

		return updatedResource.rows[0];
	}

	/**
	 * Method to delete a resource from the database.
	 *
	 * THIS WILL BE USED BY ADMIN USERS ONLY.
	 *
	 * if id not found, raise NotFoundError.
	 *
	 * @param {number} id
	 * @returns {void}
	 *
	 */
	static async deleteResource(id) {
		const result = await db.query(
			`
            DELETE FROM resources 
            WHERE resource_id = $1 
            RETURNING resource_id
        `,
			[id],
		);

		const resource = result.rows[0];
		if (!resource) throw new NotFoundError("Resource not found");
	}
}

module.exports = Resources;
