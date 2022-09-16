import DB from "../DB";

import IConfig from "../../../DB/IConfig";

import schemes from "./schemes";

class APIDB extends DB {
    constructor(opts: IConfig["db"]["mongo"]) {
        super("API", opts);
    }

    public readonly schemes = schemes;
    public readonly models = {
        cache: this.connection.model("cache", this.schemes.cacheSchema, "cache"),
        groups: this.connection.model("group", this.schemes.groupSchema, "groups"),
        replacements: this.connection.model("replacement", this.schemes.replacementSchema, "replacements"),
        specialties: this.connection.model("specialty", this.schemes.specialtySchema, "specialties"),
    };
}

export default APIDB;
