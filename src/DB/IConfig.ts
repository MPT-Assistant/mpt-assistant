import { VKOptions } from "vk-io/lib/types";

interface IConfig {
    vk: Partial<VKOptions> & { token: string };
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
