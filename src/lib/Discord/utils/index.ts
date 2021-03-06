import moment from "moment";
import rusAnonymUtils from "rus-anonym-utils";
import {
	MessageButton,
	MessageActionRow,
	MessageEmbed,
	Interaction,
} from "discord.js";
import { ExtractDoc } from "ts-mongoose";

import TextCommand from "./TextCommand";
import CallbackCommand from "./CallbackCommand";

import BotDiscord from "./types";

import DB from "../../DB";
import utils from "../../utils";
import discord from "../index";

class UtilsDiscord {
	public readonly textCommands: TextCommand[] = [];
	public readonly callbackCommands: CallbackCommand[] = [];

	public async getUserData(
		id: string,
	): Promise<ExtractDoc<typeof DB.discord.schemes.userSchema>> {
		let data = await DB.discord.models.user.findOne({
			id,
		});
		if (!data) {
			data = new DB.discord.models.user({
				id,
				ban: false,
				group: "",
				inform: true,
				reportedReplacements: [],
				regDate: new Date(),
			});
			await data.save();
		}
		return data;
	}

	public async getChatData(
		id: string,
	): Promise<ExtractDoc<typeof DB.discord.schemes.channelSchema>> {
		let data = await DB.discord.models.channel.findOne({
			id,
		});
		if (!data) {
			data = new DB.discord.models.channel({
				id,
				group: "",
				inform: true,
				reportedReplacements: [],
			});
			await data.save();
		}
		return data;
	}

	public async getGuildData(
		id: string,
	): Promise<ExtractDoc<typeof DB.discord.schemes.guildSchema>> {
		let data = await DB.discord.models.guild.findOne({
			id,
		});
		if (!data) {
			data = new DB.discord.models.guild({
				id,
				group: "",
			});
			await data.save();
		}
		return data;
	}

	public profileToEmbed(
		interaction: Interaction & { state: BotDiscord.IStateInfo },
		groupData: Awaited<ReturnType<typeof utils.mpt.getExtendGroupInfo>>,
	): MessageEmbed {
		const { specialty } = groupData;

		const profileEmbedMessage = new MessageEmbed();
		profileEmbedMessage.setAuthor({
			name: interaction.user.username,
			iconURL: interaction.user.avatarURL() || undefined,
		});
		profileEmbedMessage.setTitle(
			`Группа: ${interaction.state.user.group}
Отделение: ${specialty.name}`,
		);
		profileEmbedMessage.setDescription(
			`Информирование о заменах: ${
				interaction.state.user.inform ? "Включено" : "Отключено"
			}`,
		);
		profileEmbedMessage.setFooter({ text: "Дата регистрации" });
		profileEmbedMessage.setTimestamp(interaction.state.user.regDate);

		return profileEmbedMessage;
	}

	public scheduleToEmbed(
		schedule: Awaited<ReturnType<typeof utils.mpt.getGroupSchedule>>,
		selectedDate: moment.Moment,
		group: ExtractDoc<typeof DB.api.schemes.groupSchema>,
	): MessageEmbed {
		const selectedDayName = selectedDate.locale("ru").format("dddd");

		const embedMessage = new MessageEmbed();
		embedMessage.setTitle(
			`Расписание на ${selectedDate.format("DD.MM.YYYY")} (${selectedDayName})`,
		);
		embedMessage.setDescription(`Группа: ${group.name}
Неделя: ${schedule.week}`);
		embedMessage.addField(`Место: ${schedule.place}`, "\u200b");
		embedMessage.addFields(
			...schedule.lessons.map((lesson) => {
				return {
					name: `${lesson.num}. ${
						lesson.timetable.start.format("HH:mm:ss") +
						" - " +
						lesson.timetable.end.format("HH:mm:ss")
					}`,
					value: `${lesson.name} (${lesson.teacher})`,
				};
			}),
		);
		if (schedule.replacements.length !== 0) {
			embedMessage.addField(
				`Внимание`,
				`На выбранный день есть ${rusAnonymUtils.string.declOfNum(
					schedule.replacements.length,
					["замена", "замены", "замены"],
				)}.\nПросмотреть текущие замены можно командой "замены".`,
			);
		}
		return embedMessage;
	}

	public groupToEmbed(
		groupData: Awaited<ReturnType<typeof utils.mpt.getExtendGroupInfo>>,
	): MessageEmbed[] {
		const { group, specialty } = groupData;

		const response: MessageEmbed[] = [];

		const groupTitleEmbedMessage = new MessageEmbed();
		groupTitleEmbedMessage.setTitle(
			`Группа: ${group.name}
Отделение: ${specialty.name}`,
		);

		response.push(groupTitleEmbedMessage);

		const groupLeaders = specialty.groupsLeaders.find(
			(x) => x.name === group.name,
		);

		if (groupLeaders) {
			for (const user of groupLeaders.roles) {
				const profileEmbedMessage = new MessageEmbed();
				profileEmbedMessage.setAuthor({
					name: user.name,
					iconURL: user.photo || undefined,
				});
				profileEmbedMessage.setTitle(user.role);
				response.push(profileEmbedMessage);
			}
		}

		return response;
	}

	public replacementsToEmbed(
		replacements: Awaited<ReturnType<typeof utils.mpt.getGroupReplacements>>,
		selectedDate: moment.Moment,
		group: ExtractDoc<typeof DB.api.schemes.groupSchema>,
	): MessageEmbed {
		const selectedDayName = selectedDate.locale("ru").format("dddd");

		const embedMessage = new MessageEmbed();
		embedMessage.setTitle(
			`Замены на ${selectedDate.format("DD.MM.YYYY")} (${selectedDayName})`,
		);
		embedMessage.setDescription(`Группа: ${group.name}`);
		if (replacements.list.length === 0) {
			embedMessage.addField(`Замен на выбранный день не найдено`, "\u200b");
		} else {
			embedMessage.addField(
				`${rusAnonymUtils.string.declOfNum(replacements.list.length, [
					"Обнаружена",
					"Обнаружено",
					"Обнаружено",
				])} ${replacements.list.length} ${rusAnonymUtils.string.declOfNum(
					replacements.list.length,
					["замена", "замены", "замен"],
				)}`,
				"\u200b",
			);
			embedMessage.addFields(
				...replacements.list.map((replacement, index) => {
					return {
						name: `Замена #${index + 1}`,
						value: `Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
							"HH:mm:ss | DD.MM.YYYY",
						)}
Обнаружена ботом: ${moment(replacement.detected).format(
							"HH:mm:ss | DD.MM.YYYY",
						)}`,
					};
				}),
			);
		}

		return embedMessage;
	}

	public generateKeyboard(cmd: "lessons" | "replacements"): MessageActionRow[] {
		return [
			new MessageActionRow().setComponents([
				new MessageButton({
					label: "ЧТ",
					customId: JSON.stringify({
						cmd,
						date: utils.rest.getNextSelectDay("четверг"),
					}),
					style: "SECONDARY",
				}),
				new MessageButton({
					label: "ПТ",
					customId: JSON.stringify({
						cmd,
						date: utils.rest.getNextSelectDay("пятница"),
					}),
					style: "SECONDARY",
				}),
				new MessageButton({
					label: "СБ",
					customId: JSON.stringify({
						cmd,
						date: utils.rest.getNextSelectDay("суббота"),
					}),
					style: "SECONDARY",
				}),
			]),
			new MessageActionRow().setComponents([
				new MessageButton({
					label: "ЧТ",
					customId: JSON.stringify({
						cmd,
						date: utils.rest.getNextSelectDay("четверг"),
					}),
					style: "SECONDARY",
				}),
				new MessageButton({
					label: "ПТ",
					customId: JSON.stringify({
						cmd,
						date: utils.rest.getNextSelectDay("пятница"),
					}),
					style: "SECONDARY",
				}),
				new MessageButton({
					label: "СБ",
					customId: JSON.stringify({
						cmd,
						date: utils.rest.getNextSelectDay("суббота"),
					}),
					style: "SECONDARY",
				}),
			]),
			new MessageActionRow().setComponents([
				new MessageButton({
					label: "Вчера",
					customId: JSON.stringify({
						cmd,
						date: moment().subtract(1, "day").format("DD.MM.YYYY"),
						notDuplicate: 1,
					}),
					style: "DANGER",
				}),
				new MessageButton({
					label: "Завтра",
					customId: JSON.stringify({
						cmd,
						date: moment().add(1, "day").format("DD.MM.YYYY"),
						notDuplicate: 2,
					}),
					style: "SUCCESS",
				}),
			]),
		];
	}

	public async onNewReplacement(
		replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
	): Promise<void> {
		const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
		const message = `Обнаружена новая замена на ${replacementDate}
Группа: ${replacement.group}
Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
			"HH:mm:ss | DD.MM.YYYY",
		)}
Обнаружена ботом: ${moment(replacement.detected).format(
			"HH:mm:ss | DD.MM.YYYY",
		)}`;

		const keyboard: MessageActionRow[] = [];
		keyboard[0] = new MessageActionRow().setComponents([
			new MessageButton({
				label: `Расписание ${replacementDate}`,
				customId: JSON.stringify({
					cmd: "lessons",
					date: replacementDate,
				}),
				style: "SECONDARY",
			}),
		]);

		keyboard[1] = new MessageActionRow().setComponents([
			new MessageButton({
				label: `Замены ${replacementDate}`,
				customId: JSON.stringify({
					cmd: "replacements",
					date: replacementDate,
				}),
				style: "SECONDARY",
			}),
		]);

		const userQuery = {
			group: replacement.group,
			inform: true,
			reportedReplacements: {
				$nin: [replacement.hash],
			},
		};

		keyboard[2] = new MessageActionRow().setComponents([
			new MessageButton({
				label: "Отключить уведомления",
				customId: JSON.stringify({
					cmd: "notify",
					target: "user",
					status: false,
				}),
				style: "DANGER",
			}),
		]);

		for await (const user of DB.discord.models.user.find(userQuery)) {
			user.reportedReplacements.push(replacement.hash);
			user.markModified("reportedReplacements");

			try {
				await discord.client.users.send(user.id, {
					content: message,
					components: keyboard,
				});
			} catch (error) {
				user.inform = false;
			}

			await user.save();
		}

		const channelQuery = {
			group: replacement.group,
			inform: true,
			reportedReplacements: {
				$nin: [replacement.hash],
			},
		};

		keyboard[2] = new MessageActionRow().setComponents([
			new MessageButton({
				label: "Отключить уведомления",
				customId: JSON.stringify({
					cmd: "notify",
					target: "channel",
					status: false,
				}),
				style: "DANGER",
			}),
		]);

		for await (const channel of DB.discord.models.channel.find(channelQuery)) {
			channel.reportedReplacements.push(replacement.hash);
			channel.markModified("reportedReplacements");

			try {
				const channelInfo = await discord.client.channels.fetch(channel.id);
				if (channelInfo?.isText()) {
					await channelInfo.send({
						content: message,
						components: keyboard,
					});
				}
			} catch (error) {
				channel.inform = false;
			}

			await channel.save();
		}
	}
}

export default new UtilsDiscord();
