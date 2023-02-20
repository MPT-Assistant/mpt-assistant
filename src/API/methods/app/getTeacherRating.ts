import server from "../..";

import raUtils from "@rus-anonym/utils";
import { Type } from "@sinclair/typebox";
import { signBox } from "../../../lib/miniapp";

import DB from "../../../lib/DB";
import APIError from "../../APIError";

server.post("/app.getTeacherRating" ,{
    schema: {
        body: Type.Object({
            sign: signBox,
            name: Type.String(),
            surname: Type.String(),
            patronymic: Type.String()
        })
    }
}, async (request) => {
    const teacher = await DB.api.models.teachers.findOne({
        name: request.body.name,
        surname: request.body.surname,
        patronymic: request.body.patronymic,
    });

    if (!teacher) {
        throw new APIError({ code: 8, request });
    }

    const score = teacher.rating.find(x => {
        return x.source.type === "vk" &&
        x.source.id === request.body.sign.vk_user_id;
    });

    return {
        score: score ? score.score : null,
        rating: teacher.rating.length > 0 ? raUtils.array.number.average(teacher.rating.map(x => x.score)) : 4,
    };
});
