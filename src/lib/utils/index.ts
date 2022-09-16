import { Parser } from "@mpt-assistant/parser";

import MPT from "./lib/mpt";
import RestUtils from "./lib/rest";
import Events, { IEvents } from "./lib/events";

class Utils {
    public parser: InstanceType<typeof Parser>;
    public mpt: InstanceType<typeof MPT>;
    public rest: InstanceType<typeof RestUtils>;
    public events: Events & IEvents;

    constructor() {
        this.parser = new Parser();
        this.mpt = new MPT();
        this.rest = new RestUtils();
        this.events = new Events();
    }
}

export default new Utils();
