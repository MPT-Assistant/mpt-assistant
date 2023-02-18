import server from "../..";

import { Type } from "@sinclair/typebox";
import { signBox } from "../../../lib/miniapp";
import Bot from "../../../Bot";

server.post("/app.changeNotificationStatus" ,{
    schema: {
        body: Type.Object({
            sign: signBox,
            type: Type.Literal("replacements"),
            status: Type.Boolean()
        })
    }
}, async (req) => {
    const user = await Bot.vk.utils.getUserData(req.body.sign.vk_user_id);

    await user.updateOne({
        mailings: {
            [req.body.type]: req.body.status
        }
    });

    return true;
});
