import { Type } from "@sinclair/typebox";
import utils from "@rus-anonym/utils";

import DB from "../../../lib/DB";

import server from "../..";
import { Teacher } from "../../definitions";

server.route({
    method: ["GET", "POST"],
    url: "/teachers.getList",
    schema: {
        response: {
            200: Type.Array(Teacher)
        }
    },
    handler: async() => {
        const list = await DB.api.models.teachers.find().lean();

        return list.map(teacher => {
            return {
                ...teacher,
                rating: utils.array.number.average(teacher.rating.map(x => x.score))
            };
        });
    }
});
