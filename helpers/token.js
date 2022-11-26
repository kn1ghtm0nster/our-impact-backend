const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

function createToken(user) {
	// may end up removing this line since our users don't have admin type...yet.
	console.assert(user.isAdmin !== undefined, "User MUST be an admin");

	let payload = {
		username: user.username,
		isAdmin: user.isAdmin || false,
	};

	return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
