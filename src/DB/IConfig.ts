import { VKOptions } from "vk-io/lib/types";
import { TelegramOptions } from "puregram/lib/types/interfaces.d";

interface IConfig {
    vk: {
        group: Partial<VKOptions> & { token: string; pollingGroupId: number };
        miniapp: {
            secureKey: string;
            serviceToken: string;
        };
    };
    telegram: Partial<TelegramOptions> & { token: string };
    db: {
        mongo: {
            protocol: string;
            address: string;
            login: string;
            password: string;
        };
    };
    server: {
        port: number;
        key?: string;
        cert?: string;
    };
}

export default IConfig;
