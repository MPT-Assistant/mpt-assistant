import moment from "moment";

import server from "../../index";
import utils from "../../../utils";
import APIError from "../../Error";

import DB from "../../../DB";

import {
	ScheduleGetQueryParams,
	TSchedule,
	TScheduleGetQueryParams,
} from "../../definitions/schedule";

server.route<{ Querystring: TScheduleGetQueryParams; Reply: TSchedule }>({
	method: ["GET", "POST"],
	url: "/schedule.get",
	schema: {
		querystring: ScheduleGetQueryParams,
	},
	handler: async function (request, reply) {
		const selectedDate = moment(request.query.date);
		if (!selectedDate.isValid()) {
			throw new APIError(3, request);
		}

		let week: MPT.Week;

		const currentWeekNum = moment().week();
		if (currentWeekNum % 2 === selectedDate.week() % 2) {
			week = utils.cache.mpt.week === "Числитель" ? "Числитель" : "Знаменатель";
		} else {
			week = utils.cache.mpt.week === "Числитель" ? "Знаменатель" : "Числитель";
		}

		const groupName = request.query.group;

		const group = await DB.api.models.group.findOne({
			name: new RegExp(`^${groupName}$`, "i"),
		});

		if (!group) {
			throw new APIError(2, request);
		}

		const schedule = await utils.mpt.getGroupSchedule(group, selectedDate);

		const response: TSchedule = {
			week: {
				week,
				date: selectedDate.valueOf(),
				isNumerator: week === "Числитель",
				isDenominator: week === "Знаменатель",
			},
			group: {
				name: group.name,
				specialty: group.specialty,
			},
			schedule: {
				place: schedule.place,
				lessons: schedule.lessons.map(({ num, name, teacher }) => {
					return {
						num,
						name,
						teacher,
					};
				}),
				hasReplacements: schedule.replacements.length !== 0,
			},
		};

		return await reply.status(200).send(response);
	},
});
