import utils from "../../../../utils";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	alias: "чз",
	handler: (context) => {
		let response = `сейчас ${
			utils.cache.mpt.isNumerator ? "числитель" : "знаменатель"
		}\n\n`;

		if (new Date().getDay() === 0) {
			response += `Обратите внимание, что сегодня последний день текущей недели (воскресенье), а это значит, что уже завтра (понедельник) неделя будет иметь статус: ${
				utils.cache.mpt.isNumerator ? "знаменатель" : "числитель"
			}.`;
		}

		return context.reply(response);
	},
});
