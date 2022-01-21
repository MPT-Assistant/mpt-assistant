import server from "../../index";
import DB from "../../../DB";
import APIError from "../../Error";

import {
	Group,
	GroupsGetQueryParams,
	TGroup,
	TGroupsGetQueryParams,
} from "../../definitions/groups";

server.route<{ Querystring: TGroupsGetQueryParams; Reply: TGroup }>({
	method: ["GET", "POST"],
	url: "/groups.get",
	schema: {
		querystring: GroupsGetQueryParams,
		response: {
			200: Group,
		},
	},
	handler: async function (request, reply) {
		const groupName = request.query.name;

		const group = await DB.api.models.group.findOne({
			name: new RegExp(`^${groupName}$`, "i"),
		});

		if (group) {
			return await reply.status(200).send({
				name: group.name,
				specialty: group.specialty,
			});
		} else {
			throw new APIError(2, request);
		}
	},
});
