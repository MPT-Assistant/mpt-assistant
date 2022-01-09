import moment from "moment";
import { ExtractDoc } from "ts-mongoose";
import { SHA512 } from "crypto-js";
import utils from "rus-anonym-utils";

import internalUtils from "..";
import DB from "../../DB";
import parser from "../../parser";

class UtilsMPT {
	public getTimetable(date: moment.Moment): MPT.Timetable.ParsedElement[] {
		const response: MPT.Timetable.ParsedElement[] = [];

		for (const element of DB.timetable) {
			let status: "await" | "process" | "finished";

			const start = moment(date);
			const end = moment(date);

			start.set("hour", element.start.hour);
			start.set("minute", element.start.minute);
			start.set("second", 0);
			start.set("millisecond", 0);

			end.set("hour", element.end.hour);
			end.set("minute", element.end.minute);
			end.set("second", 0);
			end.set("millisecond", 0);

			if (date > start && date < end) {
				status = "process";
			} else if (date > start && date > end) {
				status = "finished";
			} else {
				status = "await";
			}

			response.push({
				status,
				type: element.type,
				num: element.num,
				start,
				end,
				diffStart: moment.preciseDiff(date, start, true),
				diffEnd: moment.preciseDiff(date, end, true),
			});
		}
		return response;
	}

	public async findGroup(
		groupName: string,
	): Promise<ExtractDoc<typeof DB.api.schemes.groupSchema> | string[]> {
		const selectedGroup = await DB.api.models.group.findOne({
			name: new RegExp(`^${groupName}$`, "i"),
		});

		if (!selectedGroup) {
			const diff: { group: string; diff: number }[] = [];
			for await (const group of DB.api.models.group
				.find({})
				.select({ name: 1 })) {
				diff.push({
					group: group.name,
					diff: utils.string.levenshtein(groupName, group.name, {
						replaceCase: 0,
					}),
				});
			}
			diff.sort(function (a, b) {
				if (a.diff > b.diff) {
					return 1;
				}
				if (a.diff < b.diff) {
					return -1;
				}
				return 0;
			});

			return diff.slice(0, 3).map((x) => x.group);
		} else {
			return selectedGroup;
		}
	}

	public async getExtendGroupInfo(groupName: string): Promise<{
		group: ExtractDoc<typeof DB.api.schemes.groupSchema>;
		specialty: ExtractDoc<typeof DB.api.schemes.specialtySchema>;
	}> {
		const group = await DB.api.models.group.findOne({
			name: groupName,
		});

		if (!group) {
			throw new Error(`Group not found: ${groupName}`);
		}

		const specialty = await DB.api.models.specialty.findOne({
			code: group.specialty,
		});

		if (!specialty) {
			throw new Error(`Specialty not found: ${group.specialty}`);
		}

		return { group, specialty };
	}

	public async getGroupSchedule(
		group: ExtractDoc<typeof DB.api.schemes.groupSchema>,
		selectedDate: moment.Moment,
	): Promise<{
		place: string;
		week: MPT.Week;
		lessons: MPT.Schedule.ParsedLesson[];
		replacements: ExtractDoc<typeof DB.api.schemes.replacementSchema>[];
		timetable: MPT.Timetable.ParsedElement[];
		toString(): string;
	}> {
		const replacements = await DB.api.models.replacement.find({
			group: group.name,
			date: {
				$gte: selectedDate.startOf("day").toDate(),
				$lte: selectedDate.endOf("day").toDate(),
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const schedule = group.schedule.find(
			(day) => day.num === selectedDate.day(),
		)!;

		const place = schedule.place;
		const week = this.getWeekLegend(selectedDate);
		const dayTimetable = this.getTimetable(selectedDate);

		const lessons: MPT.Schedule.ParsedLesson[] = [];

		for (const lesson of schedule.lessons) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const timetable = dayTimetable.find(
				(x) => x.type === "lesson" && x.num === lesson.num,
			)!;

			if (lesson.name.length === 1) {
				lessons.push({
					num: lesson.num,
					name: lesson.name[0],
					teacher: lesson.teacher[0],
					timetable,
				});
			} else {
				if (lesson.name[0] !== `-` && week === "Числитель") {
					lessons.push({
						num: lesson.num,
						name: lesson.name[0],
						teacher: lesson.teacher[0],
						timetable,
					});
				} else if (lesson.name[1] !== `-` && week === "Знаменатель") {
					lessons.push({
						num: lesson.num,
						name: lesson.name[1] as string,
						teacher: lesson.teacher[1] as string,
						timetable,
					});
				}
			}
		}

		if (replacements.length !== 0) {
			for (const replacement of replacements) {
				const currentLesson = lessons.find(
					(lesson) => lesson.num === replacement.lessonNum,
				);

				if (!currentLesson) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const timetable = dayTimetable.find(
						(x) => x.type === "lesson" && x.num === replacement.lessonNum,
					)!;
					lessons.push({
						num: replacement.lessonNum,
						name: replacement.newLessonName,
						teacher: replacement.newLessonTeacher,
						timetable,
					});
				} else {
					currentLesson.name = replacement.newLessonName;
					currentLesson.teacher = replacement.newLessonTeacher;
				}
			}

			lessons.sort((firstLesson, secondLesson) => {
				if (firstLesson.num > secondLesson.num) {
					return 1;
				} else if (firstLesson.num < secondLesson.num) {
					return -1;
				} else {
					return 0;
				}
			});
		}

		const toString = () => {
			const selectedDayName = selectedDate
				.locale("ru")
				.format("dddd")
				.split("");
			selectedDayName[0] = selectedDayName[0].toUpperCase();

			let responseLessonsText = "";

			for (const lesson of lessons) {
				responseLessonsText += `${
					lesson.timetable.start.format("HH:mm:ss") +
					" - " +
					lesson.timetable.end.format("HH:mm:ss")
				}\n${lesson.num}. ${lesson.name} (${lesson.teacher})\n\n`;
			}

			return `расписание на ${selectedDate.format("DD.MM.YYYY")}:
Группа: ${group.name}
День: ${selectedDayName.join("")}
Место: ${schedule.place}
Неделя: ${week}

${responseLessonsText}
${
	replacements.length !== 0
		? `\nВнимание:\nНа выбранный день есть ${utils.string.declOfNum(
				replacements.length,
				["замена", "замены", "замены"],
		  )}.\nПросмотреть текущие замены можно командой "замены".`
		: ""
}`;
		};

		return {
			place,
			week,
			lessons,
			replacements,
			timetable: dayTimetable,
			toString,
		};
	}

	public async getGroupReplacements(
		groupName: string,
		selectedDate: moment.Moment,
	): Promise<{
		list: ExtractDoc<typeof DB.api.schemes.replacementSchema>[];
		toString(): string;
	}> {
		const replacements = await DB.api.models.replacement.find({
			group: groupName,
			date: {
				$gte: selectedDate.startOf("day").toDate(),
				$lte: selectedDate.endOf("day").toDate(),
			},
		});

		const toString = () => {
			let responseReplacementsText = "";
			for (let i = 0; i < replacements.length; ++i) {
				const replacement = replacements[i];
				responseReplacementsText += `Замена #${Number(i) + 1}:
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
				)}\n\n`;
			}

			return `на выбранный день ${selectedDate.format(
				"DD.MM.YYYY",
			)} для группы ${groupName} ${utils.string.declOfNum(replacements.length, [
				"найдена",
				"найдено",
				"найдено",
			])} ${replacements.length} ${utils.string.declOfNum(replacements.length, [
				"замена",
				"замены",
				"замен",
			])}:\n\n${responseReplacementsText}`;
		};

		return { list: replacements, toString };
	}

	public getWeekLegend(selectedDate: moment.Moment): MPT.Week {
		const currentWeek = moment().week();
		if (currentWeek % 2 === selectedDate.week() % 2) {
			return internalUtils.cache.mpt.week === "Числитель"
				? "Числитель"
				: "Знаменатель";
		} else {
			return internalUtils.cache.mpt.week === "Числитель"
				? "Знаменатель"
				: "Числитель";
		}
	}

	public async updateSchedule(): Promise<void> {
		const schedule = await parser.getSchedule();
		const specialties = await parser.getSpecialtiesList();

		for (const specialty of schedule) {
			for (const group of specialty.groups) {
				let accurateSpecialty = specialties.find(
					(x) => x.code === specialty.name,
				);

				if (!accurateSpecialty) {
					const [groupSpecialtyCode] = group.name.match(
						/[А-Я]+/i,
					) as RegExpMatchArray;

					accurateSpecialty = specialties.find(
						(x) => x.code === specialty.name + `(${groupSpecialtyCode})`,
					) as MPT.Specialties.Specialty;
				}

				const response = await DB.api.models.group.updateOne(
					{ name: group.name },
					{
						name: group.name,
						specialty: accurateSpecialty.code,
						schedule: group.days,
					},
				);

				if (response.matchedCount === 0) {
					await DB.api.models.group.insertMany({
						name: group.name,
						specialty: accurateSpecialty.code,
						schedule: group.days,
					});
				}
			}
		}

		for (const specialty of specialties) {
			const advancedSpecialtyInfo = await parser.getSpecialtySite(
				specialty.name,
				specialties,
			);

			const response = await DB.api.models.specialty.updateOne(
				{
					code: advancedSpecialtyInfo.code,
				},
				advancedSpecialtyInfo,
			);

			if (response.matchedCount === 0) {
				await DB.api.models.specialty.insertMany(advancedSpecialtyInfo);
			}
		}
	}

	public async updateReplacementsList(): Promise<void> {
		const replacements = await parser.getReplacements();
		const insertedDocuments = [];

		for (const dayReplacements of replacements) {
			const date = dayReplacements.date;
			for (const groupReplacements of dayReplacements.groups) {
				const groupName = groupReplacements.group;
				for (const replacement of groupReplacements.replacements) {
					const hash = SHA512(
						`${moment(date).format("DD.MM.YYYY")}|${groupName}|${JSON.stringify(
							replacement,
						)}`,
					).toString();

					insertedDocuments.push({
						date: new Date(date),
						group: groupName,
						detected: new Date(),
						addToSite: new Date(replacement.created),
						lessonNum: replacement.num,
						oldLessonName: replacement.old.name,
						oldLessonTeacher: replacement.old.teacher,
						newLessonName: replacement.new.name,
						newLessonTeacher: replacement.new.teacher,
						hash: hash,
					});
				}
			}
		}

		const response = await DB.api.models.replacement
			.insertMany(insertedDocuments, {
				ordered: false,
			})
			.catch((err) => {
				if (Object.prototype.hasOwnProperty.call(err, "insertedDocs")) {
					(
						err.insertedDocs as ExtractDoc<
							typeof DB.api.schemes.replacementSchema
						>[]
					).map(this.emitReplacement);
				}
			});

		if (response) {
			response.map(this.emitReplacement);
		}
	}

	public async updateReplacementsOnDay(date: Date): Promise<void> {
		const replacements = await parser.getReplacementsOnDay(date);

		const insertedDocuments = [];

		for (const groupReplacements of replacements) {
			const groupName = groupReplacements.group;
			for (const replacement of groupReplacements.replacements) {
				const hash = SHA512(
					`${moment(date).format("DD.MM.YYYY")}|${groupName}|${JSON.stringify(
						replacement,
					)}`,
				).toString();

				insertedDocuments.push({
					date,
					group: groupName,
					detected: new Date(),
					addToSite: new Date(replacement.created),
					lessonNum: replacement.num,
					oldLessonName: replacement.old.name,
					oldLessonTeacher: replacement.old.teacher,
					newLessonName: replacement.new.name,
					newLessonTeacher: replacement.new.teacher,
					hash: hash,
				});
			}
		}

		const response = await DB.api.models.replacement
			.insertMany(insertedDocuments, {
				ordered: false,
			})
			.catch((err) => {
				if (Object.prototype.hasOwnProperty.call(err, "insertedDocs")) {
					(
						err.insertedDocs as ExtractDoc<
							typeof DB.api.schemes.replacementSchema
						>[]
					).map(this.emitReplacement);
				}
			});

		if (response) {
			response.map(this.emitReplacement);
		}
	}

	private emitReplacement(
		replacement: ExtractDoc<typeof DB.api.schemes.replacementSchema>,
	) {
		internalUtils.events.emit("new_replacement", replacement);
	}
}

export default UtilsMPT;
