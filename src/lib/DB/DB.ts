import mongoose from "mongoose";

import config from "../../DB/config";

abstract class Database {
    public readonly connection: mongoose.Connection;

    constructor(dbName: string) {
        const options = config.db.mongo;

        this.connection = mongoose.createConnection(
            `${options.protocol}://${options.login}:${options.password}@${options.address}/`,
            {
                autoCreate: true,
                autoIndex: true,
                dbName,
            },
        );
    }

	public abstract readonly schemes: Record<string, unknown>;
	public abstract readonly models: Record<string, unknown>;
}

export default Database;
