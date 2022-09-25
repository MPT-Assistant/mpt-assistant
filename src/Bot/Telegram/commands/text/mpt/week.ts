
import Cache from "../../../../../lib/Cache";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: ["чз", "неделя", "week"],
    description: "Текущая неделя",
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
