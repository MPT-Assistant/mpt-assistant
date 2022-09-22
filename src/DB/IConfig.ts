import { VKOptions } from "vk-io/lib/types";
import { TelegramOptions } from "puregram/lib/types/interfaces.d";

interface IConfig {
    vk: Partial<VKOptions> & { token: string; pollingGroupId: number };
    telegram: Partial<TelegramOptions> & { token: string };
    db: {
        mongo: {
            protocol: string;
            address: string;
            login: string;
            password: string;
        };
    };
}

export default IConfig;
