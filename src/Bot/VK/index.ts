import { VK } from "vk-io";
import { VKOptions } from "vk-io/lib/types";

import Bot from "../Bot";

import HandlersVK from "./handlers";
import UtilsVK from "./utils";

class VKBot extends Bot {
    public readonly instance: VK;

    public readonly utils: UtilsVK;
    public readonly handlers: HandlersVK;

    constructor(
        options: Partial<VKOptions> & {
            token: string;
            pollingGroupId: number;
        }
    ) {
        super();
        this.instance = new VK(options);
        this.utils = new UtilsVK(this);
        this.handlers = new HandlersVK(this, options.pollingGroupId);

        this.handlers.bind(this.instance.updates);
    }

    public start(): Promise<void> {
        return this.instance.updates.start();
    }
}

export default VKBot;
