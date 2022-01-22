import server from "../../index";
import DB from "../../../DB";

server.route({
	method: ["GET", "POST"],
	url: "/groups.getSpecialties",
	handler: async function (request, reply) {
		const list = await DB.api.models.group.distinct("specialty");
		return await reply.status(200).send(list);
	},
});
