const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");
const { authenticateJWT } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const citiesRoutes = require("./routes/cities");
const commentRoutes = require("./routes/comments");
const resourceRoutes = require("./routes/resources");
const likeRoutes = require("./routes/likes");
const tempRoutes = require("./routes/temps");

const app = express();
const morgan = require("morgan");

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/cities", citiesRoutes);
app.use("/comments", commentRoutes);
app.use("/resources", resourceRoutes);
app.use("/likes", likeRoutes);
app.use("/temps", tempRoutes);

/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
	return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
	if (process.env.NODE_ENV !== "test") console.error(err.stack);
	const status = err.status || 500;
	const message = err.message;

	return res.status(status).json({
		error: { message, status },
	});
});

module.exports = app;
