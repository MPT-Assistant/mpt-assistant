import mongoose from "mongoose";

import config from "../../DB/config";

mongoose.Schema.Types.String.checkRequired((v) => typeof v === "string");

abstract class DB {
	public readonly connection: mongoose.Connection;

	constructor(dbName: string) {
		this.connection = mongoose.createConnection(
			`${config.db.protocol}://${config.db.login}:${config.db.password}@${config.db.address}/`,
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

export default DB;
