import moment from "moment";
import { Static } from "@sinclair/typebox";

import utils from "../../../lib/utils";

import server from "../..";
import APIError from "../../APIError";
import { Schedule, ScheduleGetQueryParams } from "../../definitions";

const render = (schedule: Awaited<ReturnType<typeof utils.mpt.getGroupSchedule>>, date: moment.Moment): Static<typeof Schedule> => {
    return {
        place: schedule.place,
        week: {
            value: schedule.week,
            date: date.format("DD.MM.YYYY"),
            isNumerator: schedule.week === "Числитель",
            isDenominator: schedule.week === "Знаменатель",
        },
        lessons: schedule.lessons.map((lesson) => ({
            name: lesson.name,
            teacher: lesson.teacher,
            num: lesson.num,
            start: lesson.timetable.start.format("HH:mm:ss"),
            end: lesson.timetable.end.format("HH:mm:ss"),
        })),
        replacements: schedule.replacements.length ? schedule.replacements.map((replacement) => ({
            detected: moment(replacement.detected).unix(),
            addToSite: moment(replacement.addToSite).unix(),
            oldLessonName: replacement.oldLessonName,
            oldLessonTeacher: replacement.oldLessonTeacher,
            newLessonName: replacement.newLessonName,
            newLessonTeacher: replacement.newLessonTeacher,
            num: replacement.lessonNum
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
