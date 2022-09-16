import { Parser } from "@mpt-assistant/parser";

import MPT from "./lib/mpt";
import RestUtils from "./lib/rest";

class Utils {
    public parser: InstanceType<typeof Parser>;
    public mpt: InstanceType<typeof MPT>;
    public rest: InstanceType<typeof RestUtils>;

    constructor() {
        this.parser = new Parser();
        this.mpt = new MPT();
        this.rest = new RestUtils();
    }
}

export default new Utils();
