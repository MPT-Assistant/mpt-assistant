import { Type } from "@sinclair/typebox";

import DB from "../../../lib/DB";

import server from "../..";
import { GroupsGetListQueryParams } from "../../definitions";

server.route({
    method: ["GET", "POST"],
    url: "/groups.getList",
    schema: {
        querystring: GroupsGetListQueryParams,
        response: {
            200: Type.Array(Type.String())
        }
    },
    handler: async(request, reply) => {
        const specialty = request.query.specialty;
        const list = await DB.api.models.groups.distinct("name", specialty ? { specialty } : undefined);
        return await reply.send(list);
    }
});
