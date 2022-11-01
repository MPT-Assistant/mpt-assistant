import server from "../..";

import { Type } from "@sinclair/typebox";
import { signBox } from "../../../lib/miniapp";
import Bot from "../../../Bot";
import utils from "../../../lib/utils";
import APIError from "../../APIError";

server.post("/app.setUserGroup" ,{
    schema: {
        body: Type.Object({
            sign: signBox,
            group: Type.String()
        })
    }
}, async (req) => {
    const group = await utils.mpt.findGroup(req.body.group);

    if (Array.isArray(group)) {
        throw new APIError({
            code: 2,
            request: req,
        });
    }

    const user = await Bot.vk.utils.getUserData(req.body.sign.vk_user_id);

    await user.updateOne({
        group: group.name
    });

    return true;
});
