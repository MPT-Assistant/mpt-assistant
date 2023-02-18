import raUtils from "@rus-anonym/utils";

import utils from "../../../lib/utils";

import server from "../..";
import { Teacher, TeachersGetByNameQueryParams } from "../../definitions";
import APIError from "../../APIError";

server.route({
    method: ["GET", "POST"],
    url: "/teachers.getByName",
    schema: {
        querystring: TeachersGetByNameQueryParams,
        response: {
            200: Teacher
        }
    },
    handler: async (request) => {
        const teacher = await utils.mpt.getTeacherByName(request.query.name);

        if (!teacher) {
            throw new APIError({ code: 8, request });
        }

        const rating = teacher.rating.length > 0 ? raUtils.array.number.average(teacher.rating.map(x => x.score)) : 4;

        return {
            ...teacher,
            rating
        };
    }
});
