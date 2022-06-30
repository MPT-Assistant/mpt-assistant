import { VKOptions } from "vk-io/lib/types";
import { TelegramOptions } from "puregram/interfaces";

export default interface IConfig {
	db: {
		protocol: string;
		address: string;
		login: string;
		password: string;
	};
	vk: {
		group: Partial<VKOptions> & { token: string; pollingGroupId: number };
		logs: number;
	};
	discord: {
		id: string;
		token: string;
	};
	telegram: Partial<TelegramOptions> & { token: string };
	server: {
		key: string;
		cert: string;
	};
}
