import server from "../..";
import APIError from "../../APIError";
import { Group, GroupsGetQueryParams } from "../../definitions";
import utils from "../../../lib/utils";

server.route({
    method: ["GET", "POST"],
    url: "/groups.get",
    schema: {
        querystring: GroupsGetQueryParams,
        response: {
            200: Group
        }
    },
    handler: async(request, reply) => {
        const groupName = request.query.name;

        const { group, specialty } = await utils.mpt.getExtendGroupInfo(groupName).catch(() => {
            throw new APIError({ code: 2, request });
        });

        return await reply.send({
            name: group.name,
            specialty: {
                code: specialty.code,
                name: specialty.name,
                url: specialty.url
            }
        });
    }
});
