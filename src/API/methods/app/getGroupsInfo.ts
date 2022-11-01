import server from "../..";

import { Type } from "@sinclair/typebox";
import miniapp from "../../../lib/miniapp";

server.post("/app.getGroupsInfo" ,{
    schema: {
        body: Type.Object({
            group_ids: Type.Array(Type.Number(
                { maximum: -1 }
            ), {
                maxItems: 500
            })
        })
    }
}, async (req) => {
    return await miniapp.getGroupsInfo(req.body.group_ids);
});
