import { PipelineStage } from "mongoose";

import server from "../../index";
import DB from "../../../DB";

import {
	GroupsGetListQueryParams,
	TGroupList,
	TGroupsGetListQueryParams,
} from "../../definitions/groups";

server.route<{ Querystring: TGroupsGetListQueryParams; Reply: TGroupList }>({
	method: ["GET", "POST"],
	url: "/groups.getList",
	schema: {
		querystring: GroupsGetListQueryParams,
	},
	handler: async function (request, reply) {
		const pipeline: PipelineStage[] = [];

		if (request.query.specialty) {
			pipeline.push({
				$match: {
					specialty: new RegExp(
						`^${request.query.specialty.replace(
							/[-[\]{}()*+?.,\\^$|#\s]/g,
							"\\$&",
						)}`,
						"i",
					),
				},
			});
		}

		pipeline.push({
			$group: { _id: { name: "$name", specialty: "$specialty" } },
		});

		const groups = (await DB.api.models.group.aggregate(pipeline)) as {
			_id: { name: string; specialty: string };
		}[];

		return await reply.status(200).send(groups.map((x) => x._id));
	},
});
