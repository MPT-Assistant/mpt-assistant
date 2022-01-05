import moment from "moment";
import { ExtractDoc } from "ts-mongoose";
import utils from ".";

import DB from "../DB";

class MPT {
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

	public async getGroupSchedule(
		group: ExtractDoc<typeof DB.api.schemes.groupSchema>,
		selectedDate: moment.Moment,
	) {
		const replacements = await DB.api.models.replacement.find({
			group: group.name,
			date: {
				$gte: selectedDate.startOf("day").toDate(),
				$lte: selectedDate.endOf("day").toDate(),
			},
		});

		const schedule = group.schedule.find(
			(day) => day.num === selectedDate.day(),
		)!;

		const week = this.getWeekLegend(selectedDate);
		const dayTimetable = this.getTimetable(selectedDate);

		const lessons: MPT.Schedule.ParsedLesson[] = [];

		for (const lesson of schedule.lessons) {
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

		return {
			week,
			lessons,
			timetable: dayTimetable,
		};
	}

	public getWeekLegend(selectedDate: moment.Moment): MPT.Week {
		const currentWeek = moment().week();
		if (currentWeek % 2 === selectedDate.week() % 2) {
			return utils.cache.mpt.week === "Числитель" ? "Числитель" : "Знаменатель";
		} else {
			return utils.cache.mpt.week === "Числитель" ? "Знаменатель" : "Числитель";
		}
	}
}

export default MPT;
