"use-strict";

const app = require("./app");
const { addNewData } = require("./helpers/apiJobs");
const CronJob = require("cron").CronJob;
const { PORT, API_KEY } = require("./config");

/**
 * Cron job handler for making automatic requests to external API endpoint using the API key that is saved to process.env
 */
const job = new CronJob(
	"30 12 */1 * *",
	async function () {
		try {
			addNewData(API_KEY);
		} catch (err) {
			console.log(
				`ERROR WITH AUTOMATIC PROCESS PLEASE CHECK BACKEND SERVER STATUS AND CONFIGURATIONS: ${err}`,
			);
			job.stop();
		}
	},
	null,
	true,
	"America/Ojinaga",
);

app.listen(PORT, function () {
	console.log(`Backend Server started on http://localhost:${PORT}`);
	job.start();
});
