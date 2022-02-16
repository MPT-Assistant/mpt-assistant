import { MessageContext } from "vk-io";

import DB from "../../DB";

import vkUtils from "../utils";

import BotVK from "../utils/types";

const mentionRegExp = new RegExp(
	`([club${DB.config.vk.group.pollingGroupId}|[@a-z_A-ZА-Яа-я0-9]+])`,
	"gi",
);

export default async function messageNewHandler(
	context: MessageContext<BotVK.GroupMessageContextState>,
): Promise<void> {
	if (context.isOutbox || context.isGroup || !context.text) {
		return;
	}

	context.text = context.text.replace(mentionRegExp, ``);

	if (context.hasMessagePayload && context.messagePayload.cmd) {
		context.text = context.messagePayload.cmd;
	}

	const command = vkUtils.textCommands.find((x) =>
		x.check(context.text as string),
	);

	if (command) {
		context.state = {
			args: command.regexp.exec(context.text as string) as RegExpExecArray,
			user: await vkUtils.getUserData(context.senderId),
			chat: context.isChat
				? await vkUtils.getChatData(context.chatId as number)
				: undefined,
		};

		const reply = context.reply.bind(context);
		context.reply = (text, params) => {
			if (typeof text === "string") {
				text = `@id${context.senderId} (${context.state.user.nickname}), ${text}`;
				return reply(text, { disable_mentions: true, ...params });
			} else {
				if (text.message) {
					text.message = `@id${context.senderId} (${context.state.user.nickname}), ${text.message}`;
					text.disable_mentions = true;
				}
				return reply(text);
			}
		};

		await command.handler(context);
		await context.state.user.save();
		if (context.state.chat) {
			await context.state.chat.save();
		}
	} else if (!context.isChat) {
		if (
			context.messagePayload?.command &&
			context.messagePayload.command === "start"
		) {
			await context.reply(`Привет! 
Для начала нужно установить группу. 
Напиши «Установить группу *твоя группа*»`);
			return;
		}
		await context.reply({
			message: "Такой команды не существует\nСписок команд:",
			attachment: `article-188434642_189203_12d88f37969ae1c641`,
		});
	}
}
