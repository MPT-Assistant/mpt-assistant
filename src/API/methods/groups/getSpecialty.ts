import DB from "../../../lib/DB";

import server from "../..";
import APIError from "../../APIError";
import { GroupsGetSpecialtyQueryParams, Specialty } from "../../definitions";

server.route({
    method: ["GET", "POST"],
    url: "/groups.getSpecialty",
    schema: {
        querystring: GroupsGetSpecialtyQueryParams,
        response: {
            200: Specialty
        }
    },
    handler: async(request, reply) => {
        const code = request.query.code;

        const specialty = await DB.api.models.specialties.findOne({
            code
        }).lean();

        if (!specialty) {
            throw new APIError({ code: 6, request });
        }

        return await reply.send({
            code: specialty.code,
            name: specialty.name,
            url: specialty.url
        });
    }
});
