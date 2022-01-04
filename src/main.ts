import parser from "./lib/parser";

(async function () {
	const response = await parser.getSpecialtiesList();
	console.log(response);
})();
