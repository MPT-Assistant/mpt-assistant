import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: /^(?:ник)(?:\s(.*))?/i,
    func: async (ctx, bot): Promise<unknown> => {
        const args = ctx.text?.match(/^(?:ник)(?:\s(.*))$/i);
        if (!args) {
            const [userInfo] = (await bot.instance.api.users.get({ user_ids: [ctx.senderId.toString()] })) as [{first_name: string}];
            ctx.state.user.nickname = userInfo.first_name;
            return ctx.reply("ник сброшен");
        } else {
            const nickname= args[1];
            ctx.state.user.nickname = nickname;
            return ctx.reply("ник изменен");
        }
    },
});
