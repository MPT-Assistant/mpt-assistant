import { Keyboard } from "vk-io";

import VKBotTextCommand from "../../../utils/TextCommand";

import utils from "../../../../utils";

new VKBotTextCommand({
	alias: /^(?:установить группу|уг)(?:\s(.*))?$/i,
	handler: async (context) => {
		if (!context.state.args[1]) {
			return await context.reply("укажите название группы");
		}

		const group = await utils.mpt.findGroup(context.state.args[1]);

		if (Array.isArray(group)) {
			let responseText = `\nВозможно вы имели в виду какую то из этих групп:`;
			const responseKeyboard = Keyboard.builder().inline();
			const buttonColors = [
				Keyboard.POSITIVE_COLOR,
				Keyboard.SECONDARY_COLOR,
				Keyboard.NEGATIVE_COLOR,
			];
			for (let i = 0; i < 3; ++i) {
				responseKeyboard.callbackButton({
					label: group[i],
					color: buttonColors[i],
					payload: {
						cmd: "setGroup",
						group: group[i],
					},
				});
				responseKeyboard.row();

				responseText += `\n${i + 1}. ${group[i]}`;
			}
			return await context.reply(
				`группы ${context.state.args[1]} не найдено, попробуйте ещё раз.${responseText}`,
				{ keyboard: responseKeyboard },
			);
		} else {
			context.state.user.group = group.name;
			return await context.reply(
				`Вы установили себе группу ${group.name}
Отделение: ${group.specialty}`,
			);
		}
	},
});
