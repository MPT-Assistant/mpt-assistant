import axios from "axios";
import moment from "moment";
import cheerio, { CheerioAPI } from "cheerio";

class Parser {
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

	public async getReplacements(): Promise<MPT.Replacements.Day[]> {
		const $ = await this.loadPage(
			"https://www.mpt.ru/studentu/izmeneniya-v-raspisanii/",
		);

		const list = $(".container-fluid > div:nth-child(1) > div:nth-child(3)");
		const response: MPT.Replacements.Day[] = [];

		list.children().map((_index, element) => {
			if (_index === 0) {
				return;
			}

			const elem = $(element);

			if (elem[0].name === "h4") {
				const sourceDate = elem.text();
				const parsedDate = sourceDate.match(/((?:\d{2}).(?:\d{2}).(?:\d{4}))/g);
				if (parsedDate === null) {
					throw new Error("Date not found");
				}
				const date = moment(parsedDate[0], "DD.MM.YYYY").toDate();
				response.push({
					date,
					groups: [],
				});
				return;
			}

			if (elem[0].name !== "div") {
				return;
			}

			const sourceGroupNames = elem.find(
				"table:nth-child(1) > caption:nth-child(1) > b:nth-child(1)",
			);
			const groupNames = sourceGroupNames.text().split(", ");

			const replacements: MPT.Replacements.Replacement[] = [];

			const replacementsList = elem.find(
				"table:nth-child(1) > tbody:nth-child(2) > tr:not(:first-child)",
			);

			for (const element of replacementsList) {
				const elem = $(element);

				const sourceLessonNum = elem.find("td:nth-child(1)").text();
				const sourceOldLesson = elem.find("td:nth-child(3)").text();
				const sourceNewLesson = elem.find("td:nth-child(2)").text();
				const sourceAddToSite = elem.find("td:nth-child(4)").text();

				const [lessonNum, newLesson, oldLesson, addToSite]: [
					number,
					{
						name: string;
						teacher: string;
					},
					{
						name: string;
						teacher: string;
					},
					Date,
				] = [
					parseInt(sourceLessonNum),
					this.parseLesson(sourceOldLesson),
					this.parseLesson(sourceNewLesson),
					moment(sourceAddToSite, "DD.MM.YYYY HH:mm:ss").toDate(),
				];

				replacements.push({
					num: lessonNum,
					new: newLesson,
					old: oldLesson,
					created: addToSite,
				});
			}

			groupNames.map((group) => {
				response[response.length - 1].groups.push({
					group,
					replacements,
				});
			});
		});

		return response;
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
					created: selectedDate.toDate(),
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

	public async *loadReplacements(
		minimalDate: Date,
		maximumDate = new Date(),
	): AsyncGenerator<MPT.Replacements.Group[], void, unknown> {
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
		moment.locale("ru");
		const days = moment.weekdays().map((x) => new RegExp(x, "gi"));
		return days.findIndex((x) => x.test(dayName));
	}

	private parseLesson(lessonString: string): {
		name: string;
		teacher: string;
	} {
		const teacher = lessonString.match(/((?:[А-Я].){2} [А-Яа-я]*)/g);

		return {
			name: lessonString.replace(teacher ? teacher[0] : "", "").trim(),
			teacher: teacher ? teacher[0] : "Отсутствует",
		};
	}
}

export default new Parser();
