import moment from "moment";

import server from "../../index";

import DB from "../../../DB";

import { TReplacementList } from "../../definitions/replacements";

server.route<{ Reply: TReplacementList }>({
	method: ["GET", "POST"],
	url: "/replacements.getCurrent",
	handler: async function (request, reply) {
		const replacements = await DB.api.models.replacement.find({
			date: {
				$gte: moment().startOf("day").toDate(),
			},
		});

		if (!replacements) {
			return await reply.status(200).send([]);
		}

		const response: TReplacementList = replacements.map(
			({
				date,
				group,
				lessonNum,
				detected,
				addToSite,
				oldLessonName,
				oldLessonTeacher,
				newLessonName,
				newLessonTeacher,
				hash,
			}) => {
				return {
					date: moment(date).format("DD.MM.YYYY"),
					detected: moment(detected).valueOf(),
					addToSite: moment(addToSite).valueOf(),
					group,
					lessonNum,
					oldLessonName,
					oldLessonTeacher,
					newLessonName,
					newLessonTeacher,
					hash,
				};
			},
		);

		return await reply.status(200).send(response);
	},
});
