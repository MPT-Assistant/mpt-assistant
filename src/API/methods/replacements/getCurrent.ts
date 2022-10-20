import moment from "moment";

import DB from "../../../lib/DB";

import server from "../..";
import {
    ReplacementsGetQueryParams,
    ReplacementsGetResponse,
} from "../../definitions";

server.route({
    method: ["GET", "POST"],
    url: "/replacements.getCurrent",
    schema: {
        querystring: ReplacementsGetQueryParams,
        response: {
            200: ReplacementsGetResponse,
        },
    },
    handler: async (request, reply) => {
        const group = request.query.group;

        const replacements = await DB.api.models.replacements.find({
            date: {
                $gte: moment().startOf("day").toDate(),
            },
            ...(group ? { group } : {}),
        }).lean();

        return reply.send(
            replacements.map((replacement) => ({
                date: moment(replacement.date).format("DD.MM.YYYY"),
                detected: moment(replacement.detected).unix(),
                addToSite: moment(replacement.addToSite).unix(),
                lessonNum: replacement.lessonNum,
                oldLessonName: replacement.oldLessonName,
                oldLessonTeacher: replacement.oldLessonTeacher,
                newLessonName: replacement.newLessonName,
                newLessonTeacher: replacement.newLessonTeacher,
                group: replacement.group,
                hash: replacement.hash,
            }))
        );
    },
});
