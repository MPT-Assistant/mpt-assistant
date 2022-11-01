import server from "../..";

import { Type } from "@sinclair/typebox";
import { signBox } from "../../../lib/miniapp";
import Bot from "../../../Bot";

server.post("/app.getUser" ,{
    schema: {
        body: Type.Object({
            sign: signBox
        })
    }
}, async (req) => {
    const user = await Bot.vk.utils.getUserData(req.body.sign.vk_user_id);

    return {
        id: user.id,
        group: user.group,
        nickname: user.nickname,
        mailings: user.mailings,
        regDate: user.regDate
    };
});
