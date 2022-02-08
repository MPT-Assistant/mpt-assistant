import moment from "moment";
import { InlineQueryContext } from "puregram";

import utils from "../utils";

export default async function callbackQueryHandler(
	context: InlineQueryContext,
): Promise<void> {
	if (!context.from || context.from.isBot) {
		return;
	}

	const response = await utils.generateInlineQueryResult(context);

	await context.answerInlineQuery(response.results, {
		is_personal: true,
		cache_time: moment().endOf("day").diff(moment(), "seconds"),
		...(response.isGroupIsSet
			? {}
			: {
					switch_pm_text: "Установить группу",
					switch_pm_parameter: "setGroup",
			  }),
	});
}
