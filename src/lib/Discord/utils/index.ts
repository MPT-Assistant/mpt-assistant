import moment from "moment";
import rusAnonymUtils from "rus-anonym-utils";
import { MessageButton, MessageActionRow, MessageEmbed } from "discord.js";
import { ExtractDoc } from "ts-mongoose";

import TextCommand from "./TextCommand";
import CallbackCommand from "./CallbackCommand";

import DB from "../../DB";
import utils from "../../utils";

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
			new MessageActionRow({
				components: [
					new MessageButton({
						label: "ПН",
						customId: JSON.stringify({
							cmd,
							date: utils.rest.getNextSelectDay("понедельник"),
						}),
						style: "SECONDARY",
					}),
					new MessageButton({
						label: "ВТ",
						customId: JSON.stringify({
							cmd,
							date: utils.rest.getNextSelectDay("вторник"),
						}),
						style: "SECONDARY",
					}),
					new MessageButton({
						label: "СР",
						customId: JSON.stringify({
							cmd,
							date: utils.rest.getNextSelectDay("среда"),
						}),
						style: "SECONDARY",
					}),
				],
			}),
			new MessageActionRow({
				components: [
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
				],
			}),
			new MessageActionRow({
				components: [
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
				],
			}),
		];
	}
}

export default new UtilsDiscord();
