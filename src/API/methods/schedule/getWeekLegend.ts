import moment from "moment";

import utils from "../../../lib/utils";

import server from "../..";
import APIError from "../../APIError";
import { ScheduleGetWeekQueryParams, WeekLegend } from "../../definitions";

server.route({
    method: ["GET", "POST"],
    url: "/schedule.getWeekLegend",
    schema: {
        querystring: ScheduleGetWeekQueryParams,
        response: {
            200: WeekLegend
        }
    },
    handler: async(request, reply) => {
        const selectedDate = moment(
            request.query.date,
            request.query.date && "DD.MM.YYYY",
        );

        if (!selectedDate.isValid()) {
            throw new APIError({ code: 3, request });
        }

        const value = utils.mpt.getWeekLegend(selectedDate);

        return await reply.send({
            value,
            date: selectedDate.format("DD.MM.YYYY"),
            isNumerator: value === "Числитель",
            isDenominator: value === "Знаменатель",
        });
    }
});
