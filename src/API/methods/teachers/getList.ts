import { Type } from "@sinclair/typebox";
import utils from "@rus-anonym/utils";

import Cache from "../../../lib/Cache";
import DB from "../../../lib/DB";

import server from "../..";
import { Teacher, TeachersGetListQueryParams } from "../../definitions";

const getDosieId = (surname: string, name: string, patronymic: string): string | undefined => {
    const dosies = Cache.teacherDatabase;

    for (let i = 0; i < dosies.length; ++i) {
        const dosie = dosies[i];

        if (
            !dosie.name.includes(surname) ||
                !dosie.name.includes(name) ||
                !dosie.name.includes(patronymic)
        ) {
            continue;
        }

        return dosie.id;
    }

    return undefined;
};

server.route({
    method: ["GET", "POST"],
    url: "/teachers.getList",
    schema: {
        querystring: TeachersGetListQueryParams,
        response: {
            200: Type.Array(Teacher)
        }
    },
    handler: async (req) => {
        const list = await DB.api.models.teachers.find().lean();

        const isExtended = req.query.extended === "true";

        return list.map(teacher => {
            return {
                ...teacher,
                dosieId: isExtended ? getDosieId(
                    teacher.surname, teacher.name, teacher.patronymic
                ) : undefined,
                rating: teacher.rating.length > 0 ? utils.array.number.average(teacher.rating.map(x => x.score)) : 4
            };
        });
    }
});
