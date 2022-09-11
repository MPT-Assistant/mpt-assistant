import config from "../../DB/config";

class DB {
    public readonly config = Object.freeze(config);
}

export default new DB();
