import fs from "fs";
import IConfig from "./configType";

const config: IConfig = {
	db: {
		protocol: "",
		address: "",
		login: "",
		password: "",
	},
	vk: {
		group: {
			pollingGroupId: 0,
			token: "",
		},
		logs: 0,
	},
	discord: {
		id: "",
		token: "",
	},
	telegram: {
		token: "",
	},
	server: {
		key: fs
			.readFileSync(`/etc/letsencrypt/live/${process.env.CERT_DIR}/privkey.pem`)
			.toString(),
		cert: fs
			.readFileSync(
				`/etc/letsencrypt/live/${process.env.CERT_DIR}/fullchain.pem`,
			)
			.toString(),
	},
};

export default config;
