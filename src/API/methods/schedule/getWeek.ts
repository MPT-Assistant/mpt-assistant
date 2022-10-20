import { Static } from "@sinclair/typebox";

import utils from "../../../lib/utils";
import { IGroup } from "../../../lib/DB/API/types";

import server from "../..";
import APIError from "../../APIError";
import {
    ScheduleGetWeekQueryParams, WeekSchedule, WeekScheduleResponse
} from "../../definitions";

type TWeekSchedule = Static<typeof WeekSchedule>;

const getWeekSchedule = (group: IGroup, week: ReturnType<typeof utils.mpt.getWeekLegend>): TWeekSchedule => {
    const response: TWeekSchedule = [];

    for (const day of group.schedule) {
        const lessons: TWeekSchedule[number]["lessons"][number][] = [];
        for (const lesson of day.lessons) {
            if (lesson.name.length === 1) {
                lessons.push({
                    num: lesson.num,
                    name: lesson.name[0],
                    teacher: lesson.teacher[0],
                });
            } else {
                if (lesson.name[0] !== "-" && week === "Числитель") {
                    lessons.push({
                        num: lesson.num,
                        name: lesson.name[0],
                        teacher: lesson.teacher[0],
                    });
                } else if (lesson.name[1] !== "-" && week === "Знаменатель") {
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

server.route({
    method: ["GET", "POST"],
    url: "/schedule.getWeek",
    schema: {
        querystring: ScheduleGetWeekQueryParams,
        response: {
            200: WeekScheduleResponse
        }
    },
    handler: async(request, reply) => {
        const groupName = request.query.group;

        const { group } = await utils.mpt.getExtendGroupInfo(groupName).catch(() => {
            throw new APIError({ code: 2, request });
        });

        return await reply.send({
            numerator: getWeekSchedule(group, "Числитель"),
            denominator: getWeekSchedule(group, "Знаменатель"),
        });
    }
});
