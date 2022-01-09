import axios from "axios";
import moment from "moment";
import cheerio, { CheerioAPI } from "cheerio";

class Parser {
	private readonly days = [
		"Воскресенье",
		"Понедельник",
		"Вторник",
		"Среда",
		"Четверг",
		"Пятница",
		"Суббота",
	] as const;

	public async getCurrentWeek(): Promise<MPT.Week> {
		const $ = await this.loadPage(
			"https://www.mpt.ru/studentu/raspisanie-zanyatiy/",
		);
		const parsedWeek = $("span.label").text().trim();
		if (/Знаменатель/i.test(parsedWeek)) {
			return "Знаменатель";
		} else if (/Числитель/i.test(parsedWeek)) {
			return "Числитель";
		} else {
			throw new Error();
		}
	}

	public async getSchedule(): Promise<MPT.Schedule.Specialty[]> {
		const $ = await this.loadPage(
			"https://www.mpt.ru/studentu/raspisanie-zanyatiy/",
		);

		const specialtyList: MPT.Schedule.Specialty[] = [];

		const schedule = $("div.tab-content:nth-child(6)");

		schedule.children().each((_index, element) => {
			const elem = $(element);
			const specialty: MPT.Schedule.Specialty = {
				name: elem
					.find("h2:nth-child(1)")
					.text()
					.trim()
					.replace("Расписание занятий для ", ""),
				groups: [],
			};

			const specialtyGroups = elem.find(".tab-content").first();

			specialtyGroups.children().each((_index, element) => {
				const elem = $(element);

				const groupsNames = this.fixNonDecodeString(
					elem.find("h3").text().trim(),
				)
					.replace("Группа ", "")
					.split(", ");

				const groupWeekSchedule: MPT.Schedule.Day[] = [];

				const weekSchedule = elem.find("table:nth-child(2)").children();
				weekSchedule.each((_index, element) => {
					const elem = $(element);
					if (elem.prop("name") === "tbody") {
						return;
					}

					const title = elem.find("h4");
					const placeName = title.find("span").text().trim();
					const dayName = title.text().replace(placeName, "").trim();

					const daySchedule: MPT.Schedule.Day = {
						num: this.getDayNum(dayName),
						place: placeName.replace(/\(|\)/g, "") || "Отсутствует",
						lessons: [],
					};

					const schedule = elem.next().children();
					schedule.each((index, element) => {
						if (index === 0) {
							return;
						}

						const elem = $(element);
						const lessonNum = Number(elem.find("td:nth-child(1)").text());

						if (lessonNum === 0) {
							return;
						}

						let lessonName: [string, string?];
						let teacherName: [string, string?];

						const lessonElement = elem.find("td:nth-child(2)");
						const teacherElement = elem.find("td:nth-child(3)");

						if (lessonElement.children().length === 0) {
							lessonName = [lessonElement.text().trim() || "Отсутствует"];
							teacherName = [teacherElement.text().trim() || "Отсутствует"];
						} else {
							lessonName = [
								lessonElement.find("div:nth-child(1)").text().trim(),
								lessonElement.find("div:nth-child(3)").text().trim(),
							];

							teacherName = [
								teacherElement.find("div:nth-child(1)").text().trim(),
								teacherElement.find("div:nth-child(3)").text().trim(),
							];
						}

						daySchedule.lessons.push({
							num: lessonNum,
							name: lessonName,
							teacher: teacherName,
						});
					});
					groupWeekSchedule.push(daySchedule);
				});

				specialty.groups.push(
					...groupsNames.map((name) => {
						return { name, days: groupWeekSchedule };
					}),
				);
			});

			specialtyList.push(specialty);
		});

		return specialtyList;
	}

	/**
	 * Переписать
	 */
	public async getReplacements(): Promise<MPT.Replacements.Day[]> {
		const $ = await this.loadPage(
			"https://www.mpt.ru/studentu/izmeneniya-v-raspisanii/",
		);
		const replacementsParsedList = $(
			$("body > div.page > main > div > div > div:nth-child(3)").children(),
		);

		const replacementsList: MPT.Replacements.Day[] = [];

		const tempReplacementsOnDay: {
			date: Date;
			replacements: Array<{
				group: string;
				num: number;
				oldLesson: string;
				newLesson: string;
				updated: Date;
			}>;
		} = {
			date: new Date(0),
			replacements: [],
		};

		const processReplacementsOnDay = () => {
			const replacementsOnThisDay = tempReplacementsOnDay.replacements.map(
				(tempReplacement) => {
					const oldLessonData = this.parseLesson(tempReplacement.oldLesson);
					const newLessonData = this.parseLesson(tempReplacement.newLesson);
					return {
						group: tempReplacement.group,
						num: tempReplacement.num,
						oldLessonTeacher: oldLessonData.teacher,
						oldLessonName: oldLessonData.name,
						newLessonTeacher: newLessonData.teacher,
						newLessonName: newLessonData.name,
						updated: tempReplacement.updated.valueOf(),
					};
				},
			);

			for (const tempReplacement of replacementsOnThisDay) {
				const replacementDay =
					replacementsList.find(
						(x: { date: number }) =>
							x.date === tempReplacementsOnDay.date.valueOf(),
					) ||
					replacementsList[
						replacementsList.push({
							date: tempReplacementsOnDay.date.valueOf(),
							groups: [],
						}) - 1
					];
				const groupWithReplacements =
					replacementDay.groups.find(
						(x: { group: string }) => x.group === tempReplacement.group,
					) ||
					replacementDay.groups[
						replacementDay.groups.push({
							group: tempReplacement.group,
							replacements: [],
						}) - 1
					];
				groupWithReplacements.replacements.push({
					num: tempReplacement.num,
					new: {
						name: tempReplacement.newLessonName,
						teacher: tempReplacement.newLessonTeacher,
					},
					old: {
						name: tempReplacement.oldLessonName,
						teacher: tempReplacement.oldLessonTeacher,
					},
					created: tempReplacement.updated,
				});
			}
		};

		replacementsParsedList.each((_elementIndex, element) => {
			const selectedElement = $(element);
			if (selectedElement.get()[0].name === "h4") {
				let parsedDate = $($(selectedElement).children()[0]).text();
				parsedDate = parsedDate.split(".").reverse().join("-");
				if (Number(tempReplacementsOnDay.date) !== 0) {
					processReplacementsOnDay();
					tempReplacementsOnDay.replacements = [];
				}
				tempReplacementsOnDay.date = new Date(parsedDate);
			} else if (
				selectedElement.get()[0].name === "div" &&
				selectedElement.attr("class") === "table-responsive"
			) {
				const PreParsedData = selectedElement.children().children();
				const GroupsNames = this.fixNonDecodeString(
					$($(PreParsedData[0]).children()[0]).text(),
				).split(", ");
				for (const group of GroupsNames) {
					const replacementsTable = $(PreParsedData[1]).children();
					for (let i = 1; i < replacementsTable.length; i++) {
						const tempReplacement = $(replacementsTable[i]);

						const lessonNumber = tempReplacement
							.find("td.lesson-number")
							.text();
						const oldLesson = tempReplacement.find("td.replace-from").text();
						const newLesson = tempReplacement.find("td.replace-to").text();
						const updatedAt = tempReplacement.find("td.updated-at").text();

						tempReplacementsOnDay.replacements.push({
							group: group,
							num: Number(lessonNumber),
							oldLesson: oldLesson.trim(),
							newLesson: newLesson.trim(),
							updated: new Date(
								updatedAt.split(` `)[0].split(`.`).reverse().join(`-`) +
									` ` +
									updatedAt.split(` `)[1],
							),
						});
					}
				}
			}
		});
		processReplacementsOnDay();

		return replacementsList;
	}

	public async getReplacementsOnDay(
		date: moment.MomentInput = new Date(),
	): Promise<MPT.Replacements.Group[]> {
		const selectedDate = moment(date);
		selectedDate.set("milliseconds", 0);
		selectedDate.set("seconds", 0);
		selectedDate.set("minutes", 0);
		selectedDate.set("hours", 0);

		const $ = await this.loadPage(
			`https://www.mpt.ru/rasp-management/print-replaces.php?date=${moment(
				date,
			).format("YYYY-MM-DD")}`,
		);
		const response: MPT.Replacements.Group[] = [];
		const list = $("body").children();

		list.each((_index, element) => {
			if (_index === 0) {
				return;
			}
			const elem = $(element);
			const groupName = elem.find("caption").text().trim();
			const replacementsList = elem.find("tbody");

			const replacements: MPT.Replacements.Replacement[] = [];

			replacementsList.children().each((_index, element) => {
				if (_index === 0) {
					return;
				}
				const elem = $(element);
				const num = Number(elem.find("td:nth-child(1)").text().trim());

				const oldLessonString = elem.find("td:nth-child(2)").text().trim();
				const newLessonString = elem.find("td:nth-child(3)").text().trim();

				const oldLesson = this.parseLesson(oldLessonString);
				const newLesson = this.parseLesson(newLessonString);

				replacements.push({
					new: newLesson,
					old: oldLesson,
					num,
					created: selectedDate.valueOf(),
				});
			});

			response.push(
				...groupName.split(", ").map((group) => {
					return { group, replacements };
				}),
			);
		});

		return response;
	}

	public async getSpecialtiesList(): Promise<MPT.Specialties.Specialty[]> {
		const $ = await this.loadPage("https://mpt.ru/sites-otdels/");
		const list = $(".container-fluid > div:nth-child(1) > div:nth-child(3)");
		const response: MPT.Specialties.Specialty[] = [];
		list.children().map((_index, element) => {
			const elem = $(element).find("a");
			const name = elem.text().trim();
			response.push({
				name,
				code: name.match(
					/(\d\d\.\d\d\.\d\d(?:(?:\([А-Я]+\))?)|Отделение первого курса)/g,
				)?.[0] as string,
				url: (elem.attr("href") as string).trim(),
			});
		});
		return response;
	}

	public async getSpecialtySite(
		specialty: string,
		specialtiesList?: MPT.Specialties.Specialty[],
	): Promise<MPT.Specialties.Site> {
		if (!specialtiesList) {
			specialtiesList = await this.getSpecialtiesList();
		}

		const regexp = new RegExp(
			specialty.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&"),
			"ig",
		);

		const specialtyInfo = specialtiesList.find((x) => regexp.test(x.name));

		if (!specialtyInfo) {
			throw new Error("Specialty not found");
		}

		const response: MPT.Specialties.Site = {
			...specialtyInfo,
			importantInformation: [],
			news: [],
			examQuestions: [],
			groupsLeaders: [],
		};

		const specialtySite = (await axios.get(specialtyInfo.url)).data;
		const $ = cheerio.load(specialtySite);

		const importantInformation = $(
			".col-sm-8 > div:contains(Важная информация!) > ul",
		);
		importantInformation.children().map((_index, element) => {
			const elem = $(element);
			const news = elem.find("a");
			const date = elem.find("div").text().trim();
			const name = news.text().trim();
			const link = (news.attr("href") as string).trim();
			const url = link ? `https://mpt.ru/${link}` : "";
			response.importantInformation.push({
				name,
				url,
				date: moment(date, "DD.MM.YYYY").toDate(),
			});
		});

		const groupsLeadersList = $(
			"div.block_no-margin:contains(Активы групп)",
		).find(".tab-content");
		groupsLeadersList.children().map((_index, element) => {
			const elem = $(element);
			const name = elem.find("h3").text().trim();

			const groupInfo: MPT.Specialties.SiteGroupLeaders = {
				name,
				roles: [],
			};

			elem.find("table").map((_index, element) => {
				const elem = $(element);
				const [photo, role, name] = elem.find("tr").children();
				const photoSrc = $(photo).find("img").attr("src") as string;
				groupInfo.roles.push({
					photo: photoSrc ? `https://mpt.ru/${photoSrc}` : "",
					role: $(role).text().trim(),
					name: $(name).text().trim(),
				});
			});

			if (groupInfo.roles.length > 0) {
				response.groupsLeaders.push(groupInfo);
			}
		});

		const news = $(".col-sm-8 > div:contains(Новости) > ul");
		news.children().map((_index, element) => {
			const elem = $(element);
			const news = elem.find("a");
			const date = elem.find("div").text().trim();
			const name = news.text().trim();
			const link = (news.attr("href") as string).trim();
			const url = link ? `https://mpt.ru/${link}` : "";
			response.news.push({
				name,
				url,
				date: moment(date, "DD.MM.YYYY").toDate(),
			});
		});

		const examQuestions = $(".table-hover > tbody:nth-child(2)");
		examQuestions.children().map((_index, element) => {
			const elem = $(element);
			const document = elem.find("a");
			const name = document.text().trim();
			const link = (document.attr("href") as string).trim();
			const url = link ? `https://mpt.ru/${link}` : "";
			const date = elem.find("td:nth-child(2)").text().trim();
			response.examQuestions.push({
				name,
				url,
				date: moment(date, "DD.MM.YYYY HH:mm:ss").toDate(),
			});
		});

		return response;
	}

	public async *loadReplacements(minimalDate: Date, maximumDate = new Date()) {
		const selectedDate = moment(minimalDate);
		selectedDate.isBefore(maximumDate);

		while (selectedDate.isBefore(maximumDate)) {
			yield await this.getReplacementsOnDay(selectedDate);
		}
	}

	private generateCookie(): string {
		const id = Math.random().toString(36).substring(2);
		return `PHPSESSID=MPT_Assistant#${id};`;
	}

	private async loadPage(url: string): Promise<CheerioAPI> {
		const html = (
			await axios.get(url, {
				headers: {
					cookie: this.generateCookie(), // Bypassing an error bad request (occurs with a large number of requests from one IP)
				},
			})
		).data;

		return cheerio.load(html);
	}

	private fixNonDecodeString(input: string): string {
		try {
			return decodeURI(
				input.replace("_2C ", ", ").replace("_2F", "/").replace(/_/gi, "%"),
			);
		} catch (error) {
			return input;
		}
	}

	private getDayNum(dayName: string): number {
		return this.days.findIndex((x) => new RegExp(x, "gi").test(dayName));
	}

	private parseLesson(lessonString: string): {
		name: string;
		teacher: string;
	} {
		if (
			/(([А-Я]\.[А-Я]\. [А-Я][а-я]+)?( \(.*\)))?(?:, )?(([А-Я]\.[А-Я]\. [А-Я][а-я]+)?( \(.*\)))/g.test(
				lessonString,
			)
		) {
			const execResult =
				/(([А-Я]\.[А-Я]\. [А-Я][а-я]+)?( \(.*\)))?(?:, )?(([А-Я]\.[А-Я]\. [А-Я][а-я]+)?( \(.*\)))/g.exec(
					lessonString,
				);
			if (!execResult) {
				return {
					name: lessonString,
					teacher: "Отсутствует",
				};
			}
			return {
				name: execResult.input.substring(0, execResult.index).trim(),
				teacher: [execResult[1], execResult[4]].join(", "),
			};
		} else {
			const execResult =
				/([А-Я]\.[А-Я]\. [А-Я][а-я]+)?(?:, )?([А-Я]\.[А-Я]\. [А-Я][а-я]+)/g.exec(
					lessonString,
				);
			if (!execResult) {
				return {
					name: lessonString,
					teacher: "Отсутствует",
				};
			}
			return {
				name: execResult.input.substring(0, execResult.index).trim(),
				teacher: execResult[0],
			};
		}
	}
}

export default new Parser();
