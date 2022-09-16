import DB from "../DB";

import IConfig from "../../../DB/IConfig";

import schemes from "./schemes";

class VKDB extends DB {
    constructor(opts: IConfig["db"]["mongo"]) {
        super("vk", opts);
    }

    public readonly schemes = schemes;
    public readonly models = {
        users: this.connection.model("user", this.schemes.userSchema, "users"),
        chats: this.connection.model("chat", this.schemes.chatSchema, "chats"),
    };
}

export default VKDB;
