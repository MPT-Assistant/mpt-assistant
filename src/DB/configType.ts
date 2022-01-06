import { VKOptions } from "vk-io/lib/types";
import { TelegramOptions } from "./../../node_modules/puregram/lib/interfaces.d";
export default interface IConfig {
	db: {
		protocol: string;
		address: string;
		login: string;
		password: string;
	};
	vk: {
		group: Partial<VKOptions> & { token: string; pollingGroupId: number };
	};
	discord: {
		id: string;
		token: string;
	};
	telegram: Partial<TelegramOptions> & { token: string };
}
