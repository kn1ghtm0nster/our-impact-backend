const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config");

async function commonBeforeAll() {
	await db.query("DELETE FROM cities");
	await db.query("DELETE FROM users");
	await db.query("DELETE FROM comments");

	await db.query(`
	INSERT INTO cities (city_name, country_code, lattitude, longitude)
	VALUES (
		'Paris',
		'FR',
		48.8588897,
		2.3200410217200766
	),
	(
		'Toulouse',
		'FR',
		43.6044622,
		1.4442469
	),
	(
		'London',
		'GB',
		51.5073219,
		-0.1276474
	),
	(
		'Inverness',
		'GB',
		57.4790124,
		-4.225739
	),
	(
		'Beijing',
		'CN',
		39.906217,
		116.3912757
	),
	(
		'Xinxiang',
		'CN',
		35.3021133,
		113.9202062
	),
	(
		'Tokyo',
		'JP',
		35.6828387,
		139.7594549
	),
	(
		'Kyoto',
		'JP',
		35.021041,
		135.7556075
	),
	(
		'Toronto',
		'CA',
		43.6534817,
		-79.3839347
	),
	(
		'Vancouver',
		'CA',
		49.2608724,
		-123.113952
	),
	(
		'Dallas',
		'US',
		32.7762719,
		-96.7968559
	),
	(
		'New Orleans',
		'US',
		29.9759983,
		-90.0782127
	),
	(
		'Berlin',
		'DE',
		52.5170365,
		13.3888599
	),
	(
		'Frankfurt',
		'DE',
		50.1106444,
		8.6820917
	),
	(
		'Delhi',
		'IN',
		28.6517178,
		77.2219388
	),
	(
		'Hapur',
		'IN',
		28.7299677,
		77.775499
	),
	(
		'Mexico City',
		'MX',
		19.4326296,
		-99.1331785
	),
	(
		'Aguascalientes',
		'MX',
		21.880487,
		-102.2967195
	),
	(
		'Sydney',
		'AU',
		-33.8698439,
		151.2082848
	),
	(
		'Perth',
		'AU',
		-31.9558964,
		115.8605801
	)
	`);

	await db.query(
		`
        INSERT INTO users (
            username,
            password,
            first_name,
            last_name,
            email,
            city_name
        )
        VALUES ('user#1', $1, 'user1First', 'user1Last', 'user1@email.com', 'Dallas'),
               ('user#2', $2, 'user2First', 'user2Last', 'user2@email.com', 'Dallas')

    `,
		[
			await bcrypt.hash('password1', BCRYPT_WORK_FACTOR),
			await bcrypt.hash('password2', BCRYPT_WORK_FACTOR),
		]
	);

	await db.query(`
		INSERT INTO comments (comment_text, username, city_name)
		VALUES (
			'This is a comment from u1',
			'user#1',
			'Paris'
		),
		(
			'this is a comment from u2',
			'user#2',
			'Dallas'
		)
	`);
}

async function commonBeforeEach() {
	await db.query("BEGIN");
}

async function commonAfterEach() {
	await db.query("ROLLBACK");
}

async function commonAfterAll() {
	await db.end();
}

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
};
