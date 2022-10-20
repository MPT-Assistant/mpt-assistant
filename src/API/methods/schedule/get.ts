import moment from "moment";
import { Static } from "@sinclair/typebox";

import utils from "../../../lib/utils";

import server from "../..";
import APIError from "../../APIError";
import { Schedule, ScheduleGetQueryParams } from "../../definitions";

const render = (schedule: Awaited<ReturnType<typeof utils.mpt.getGroupSchedule>>, date: moment.Moment): Static<typeof Schedule> => {
    const value = utils.mpt.getWeekLegend(date);
    return {
        place: schedule.place,
        week: {
            value,
            date: date.format("DD.MM.YYYY"),
            isNumerator: value === "Числитель",
            isDenominator: value === "Знаменатель",
        },
        lessons: schedule.lessons.map((lesson) => ({
            name: lesson.name,
            teacher: lesson.teacher,
            num: lesson.num,
        })),
        replacements: schedule.replacements.length ? schedule.replacements.map((replacement) => ({
            detected: Math.floor(new Date(replacement.detected).getTime() / 1000),
            addToSite: Math.floor(new Date(replacement.addToSite).getTime() / 1000),
            oldLessonName: replacement.oldLessonName,
            oldLessonTeacher: replacement.oldLessonTeacher,
            newLessonName: replacement.newLessonName,
            newLessonTeacher: replacement.newLessonTeacher,
        })) : undefined,
    };
};

server.route({
    method: ["GET", "POST"],
    url: "/schedule.get",
    schema: {
        querystring: ScheduleGetQueryParams,
        response: {
            200: Schedule
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

        const groupName = request.query.group;

        const { group } = await utils.mpt.getExtendGroupInfo(groupName).catch(() => {
            throw new APIError({ code: 2, request });
        });

        const schedule = await utils.mpt.getGroupSchedule(group, selectedDate);

        return await reply.send(render(schedule, selectedDate));
    }
});
