import server from "../../index";
import DB from "../../../DB";

import { GroupList, TGroupList } from "../../definitions/groups";

server.route<{ Reply: TGroupList }>({
	method: ["GET", "POST"],
	url: "/groups.list",
	schema: {
		response: {
			200: GroupList,
		},
	},
	handler: async function (request, reply) {
		const groups = (await DB.api.models.group.aggregate([
			{
				$group: { _id: { name: "$name", specialty: "$specialty" } },
			},
		])) as { _id: { name: string; specialty: string } }[];

		return await reply.status(200).send(groups.map((x) => x._id));
	},
});
