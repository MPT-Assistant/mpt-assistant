import MPT from "./mpt";
import Cache from "./cache";

class Utils {
	public readonly cache = new Cache();
	public readonly mpt = new MPT();
}

export default new Utils();
