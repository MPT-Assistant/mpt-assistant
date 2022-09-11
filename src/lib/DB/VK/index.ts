import DB from "../DB";

import schemes from "./schemes";

class VKDB extends DB {
    constructor() {
        super("vk");
    }

    public readonly schemes = schemes;
    public readonly models = {
        users: this.connection.model("users", this.schemes.userSchema),
        chats: this.connection.model("chats", this.schemes.chatSchema),
    };
}

export default VKDB;
