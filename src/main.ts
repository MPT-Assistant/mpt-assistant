import DB from "./lib/DB";

(async function () {
	const response = await DB.api.connection.asPromise();
	console.log("Connected to DB");
})();
