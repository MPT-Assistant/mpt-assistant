import { Type } from "@sinclair/typebox";

import DB from "../../../lib/DB";

import server from "../..";

server.route({
    method: ["GET", "POST"],
    url: "/groups.getSpecialtiesList",
    schema: {
        response: {
            200: Type.Array(Type.String())
        }
    },
    handler: async(request, reply) => {
        const list = await DB.api.models.specialties.distinct("code");
        return await reply.send(list);
    }
});
