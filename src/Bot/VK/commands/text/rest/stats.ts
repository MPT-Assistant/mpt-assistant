import moment from "moment";

import Cache from "../../../../../lib/Cache";
import DB from "../../../../../lib/DB";
import TextCommand from "../../../TextCommand";

new TextCommand({
    trigger: "/stats",
    func: async (context): Promise<void> => {
        const [vkUsers, vkChats, groups, specialties, replacements] =
            await Promise.all([
                DB.vk.models.users.countDocuments(),
                DB.vk.models.chats.countDocuments(),
                DB.api.models.groups.countDocuments(),
                DB.api.models.specialties.countDocuments(),
                DB.api.models.replacements.countDocuments(),
            ]);

        await context.reply(`stats:
VK users: ${vkUsers}
VK chats: ${vkChats}

Groups: ${groups}
Specialties: ${specialties}
Replacements: ${replacements}
Launched: ${moment()
        .subtract(process.uptime(), "seconds")
        .format(" HH:mm:ss, DD.MM.YYYY")}
Last update: ${moment(Cache.lastUpdate).format("HH:mm:ss, DD.MM.YYYY")}`);
        return;
    },
});
