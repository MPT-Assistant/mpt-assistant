import moment from "moment";

import server from "../../index";
import utils from "../../../utils";
import APIError from "../../Error";

import {
	ScheduleGetWeekQueryParams,
	TWeek,
	TScheduleGetWeekQueryParams,
} from "../../definitions/schedule";

server.route<{ Querystring: TScheduleGetWeekQueryParams; Reply: TWeek }>({
	method: ["GET", "POST"],
	url: "/schedule.getWeek",
	schema: {
		querystring: ScheduleGetWeekQueryParams,
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

		const response: TWeek = {
			week,
			date: selectedDate.valueOf(),
			isNumerator: week === "Числитель",
			isDenominator: week === "Знаменатель",
		};

		return await reply.status(200).send(response);
	},
});
