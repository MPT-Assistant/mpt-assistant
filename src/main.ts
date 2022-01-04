import DB from "./lib/DB";

(async function () {
	await DB.vk.connection.asPromise();
	console.log(await DB.vk.models.user.findOne({}));
})();
