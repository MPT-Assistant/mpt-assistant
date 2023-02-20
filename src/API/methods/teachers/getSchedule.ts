import utils from "../../../lib/utils";

import server from "../..";
import { TeacherGetScheduleQueryParams, TeacherSchedule } from "../../definitions";
import APIError from "../../APIError";
import moment from "moment";
import DB from "../../../lib/DB";
import { PipelineStage } from "mongoose";
import { Static } from "@sinclair/typebox";

interface IAggregationItem {
    place: string;
    group: string;
    num: number;
}

server.route({
    method: ["GET", "POST"],
    url: "/teachers.getSchedule",
    schema: {
        querystring: TeacherGetScheduleQueryParams,
        response: {
            200: TeacherSchedule
        }
    },
    handler: async (request) => {
        const teacher = await utils.mpt.getTeacherByName(request.query.teacher);

        if (!teacher) {
            throw new APIError({ code: 8, request });
        }

        const selectedDate = moment(
            request.query.date,
            request.query.date && "DD.MM.YYYY",
        );

        if (!selectedDate.isValid()) {
            throw new APIError({ code: 3, request });
        }

        const week = utils.mpt.getWeekLegend(selectedDate);

        const aggregation: PipelineStage[] = [
            {
                $unwind: {
                    path: "$schedule",
                },
            },
            {
                $match: {
                    "schedule.num": selectedDate.day(),
                },
            },
            {
                $unwind: {
                    path: "$schedule.lessons",
                },
            },
            {
                $project: {
                    place: "$schedule.place",
                    group: "$name",
                    week: {
                        $indexOfArray: [
                            "$schedule.lessons.teacher",
                            `${teacher.name[0]}.${teacher.patronymic[0]}. ${teacher.surname}`,
                        ],
                    },
                    num: "$schedule.lessons.num",
                },
            },
            {
                $match: {
                    week: week === "Числитель" ? 0 : 1,
                },
            },
            {
                $project: {
                    _id: false,
                    group: true,
                    place: true,
                    num: true,
                },
            },
            {
                $sort: {
                    num: 1
                }
            }
        ];

        const schedule = await DB.api.models.groups.aggregate<IAggregationItem>(aggregation);

        const lessons: Static<typeof TeacherSchedule>["lessons"] = [];

        for (const lesson of schedule) {
            const value = lessons.find(x => x.num === lesson.num);

            if (value) {
                value.group.push(lesson.group);
            } else {
                lessons.push({
                    place: lesson.place,
                    group: [lesson.group],
                    num: lesson.num
                });
            }
        }

        return {
            week: {
                value: week,
                date: selectedDate.format("DD.MM.YYYY"),
                isNumerator: week === "Числитель",
                isDenominator: week === "Знаменатель",
            },
            lessons
        };
    }
});
