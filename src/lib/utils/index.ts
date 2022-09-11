import { Parser } from "@mpt-assistant/parser";

import MPT from "./lib/MPT";

class Utils {
    public parser: InstanceType<typeof Parser>;
    public mpt: MPT;

    constructor() {
        this.parser = new Parser();
        this.mpt = new MPT();
    }
}

export default new Utils();
