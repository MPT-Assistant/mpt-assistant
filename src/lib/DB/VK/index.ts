import DB from "../DB";

import schemes from "./schemes";

class VKDB extends DB {
    constructor() {
        super("vk");
    }

    public readonly schemes = schemes;
    public readonly models = {
        users: this.connection.model("users", this.schemes.userSchema),
    };
}

export default VKDB;
