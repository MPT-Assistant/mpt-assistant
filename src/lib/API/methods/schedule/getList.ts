import { ExtractDoc } from "ts-mongoose";

import server from "../../index";
import APIError from "../../Error";

import DB from "../../../DB";

import {
	ScheduleGetListQueryParams,
	TScheduleList,
	TScheduleGetListQueryParams,
	TScheduleListDay,
	TScheduleLesson,
} from "../../definitions/schedule";

const getWeek = (
	group: ExtractDoc<typeof DB.api.schemes.groupSchema>,
	week: MPT.Week,
): TScheduleListDay[] => {
	const response: TScheduleListDay[] = [];

	for (const day of group.schedule) {
		const lessons: TScheduleLesson[] = [];
		for (const lesson of day.lessons) {
			if (lesson.name.length === 1) {
				lessons.push({
					num: lesson.num,
					name: lesson.name[0],
					teacher: lesson.teacher[0],
				});
			} else {
				if (lesson.name[0] !== `-` && week === "Числитель") {
					lessons.push({
						num: lesson.num,
						name: lesson.name[0],
						teacher: lesson.teacher[0],
					});
				} else if (lesson.name[1] !== `-` && week === "Знаменатель") {
					lessons.push({
						num: lesson.num,
						name: lesson.name[1] as string,
						teacher: lesson.teacher[1] as string,
					});
				}
			}
		}
		response.push({
			num: day.num,
			place: day.place,
			lessons,
		});
	}

	return response;
};

server.route<{
	Querystring: TScheduleGetListQueryParams;
	Reply: TScheduleList;
}>({
	method: ["GET", "POST"],
	url: "/schedule.getList",
	schema: {
		querystring: ScheduleGetListQueryParams,
	},
	handler: async function (request, reply) {
		const groupName = request.query.group;

		const group = await DB.api.models.group.findOne({
			name: new RegExp(`^${groupName}$`, "i"),
		});

		if (!group) {
			throw new APIError({ code: 2, request });
		}

		const response: TScheduleList = {
			numerator: getWeek(group, "Числитель"),
			denominator: getWeek(group, "Знаменатель"),
		};

		return await reply.status(200).send(response);
	},
});
