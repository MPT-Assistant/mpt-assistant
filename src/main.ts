import moment from "moment";
import utils from "./lib/utils";

(async function () {
	await utils.cache.update();
	console.log(utils.mpt);
})();
