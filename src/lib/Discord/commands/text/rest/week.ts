import utils from "../../../../utils";

import TextCommand from "../../../utils/TextCommand";

new TextCommand({
	name: "неделя",
	description: "Показывает какая сейчас неделя, числитель или знаменатель",
	handler: (interaction) => {
		let response = `Сейчас ${
			utils.cache.mpt.isNumerator ? "числитель" : "знаменатель"
		}\n\n`;

		if (new Date().getDay() === 0) {
			response += `Обратите внимание, что сегодня последний день текущей недели (воскресенье), а это значит, что уже завтра (понедельник) неделя будет иметь статус: ${
				utils.cache.mpt.isNumerator ? "знаменатель" : "числитель"
			}.`;
		}

		return interaction.editReply(response);
	},
});
