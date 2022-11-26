"use strict";

const db = require("../db.js");
const User = require("../models/user");
// const Comment = require("../models/comment");
const City = require("../models/city");

const { createToken } = require("../helpers/token");


async function commonBeforeAll() {

	await db.query('DELETE FROM cities');
	await db.query('DELETE FROM users');

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

	await User.registerUser({
		username: 'routesUser1',
		password: 'password1',
		firstName: 'U1F',
		lastName: 'U1L',
		email: 'user1@user.com',
		userCity: 'Dallas',
	});
	await User.registerUser({
		username: 'routesUser2',
		password: 'password2',
		firstName: 'U2F',
		lastName: 'U2L',
		email: 'user2@user.com',
		userCity: 'Paris',
	});
	await User.registerNewAdmin({
		username: 'routesAdmin1',
		password: 'adminpassword1',
		firstName: 'A1F',
		lastName: 'A1L',
		email: 'admin@user.com',
		isAdmin: true,
	});
}

async function commonBeforeEach() {
	await db.query('BEGIN');
}

async function commonAfterEach() {
	await db.query('ROLLBACK');
}

async function commonAfterAll() {
	await db.end();
}

const u1Token = createToken({ username: 'routesUser1', isAdmin: false });
const u2Token = createToken({ username: 'routesUser2', isAdmin: false });
const adminToken = createToken({ username: 'routesAdmin1', isAdmin: true });

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	u1Token,
	u2Token,
	adminToken,
};
