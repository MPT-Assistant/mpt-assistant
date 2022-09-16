
import Cache from "../../../../../lib/Cache";
import RegExpCommand from "../../../RegExpCommand";

new RegExpCommand({
    trigger: /^(чз|неделя)/i,
    func: async (context): Promise<void> => {
        let response = `сейчас ${
            Cache.week.isNumerator ? "числитель" : "знаменатель"
        }\n\n`;

        if (new Date().getDay() === 0) {
            response += `Обратите внимание, что сегодня последний день текущей недели (воскресенье), а это значит, что уже завтра (понедельник) неделя будет иметь статус: ${
                Cache.week.isNumerator ? "знаменатель" : "числитель"
            }.`;
        }

        await context.reply(response);
        return;
    },
});
