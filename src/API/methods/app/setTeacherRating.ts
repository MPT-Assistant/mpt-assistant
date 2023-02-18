import server from "../..";

import { Type } from "@sinclair/typebox";
import { signBox } from "../../../lib/miniapp";

import DB from "../../../lib/DB";
import APIError from "../../APIError";

server.post("/app.setTeacherRating" ,{
    schema: {
        body: Type.Object({
            sign: signBox,
            score: Type.Number({
                minimum: 0,
                maximum: 5
            }),
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

    if (score) {
        score.score = request.body.score;
    } else {
        teacher.rating.push({
            score: request.body.score,
            source: {
                type: "vk",
                id: request.body.sign.vk_user_id
            }
        });
    }

    return 1;
});
