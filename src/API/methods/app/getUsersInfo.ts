import server from "../..";

import { Type } from "@sinclair/typebox";
import miniapp from "../../../lib/miniapp";

server.post("/app.getUsersInfo" ,{
    schema: {
        body: Type.Object({
            user_ids: Type.Array(Type.Number(
                { minimum: 1 }
            ), {
                maxItems: 500
            })
        })
    }
}, async (req) => {
    return await miniapp.getUsersInfo(req.body.user_ids);
});
