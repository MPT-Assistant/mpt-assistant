import MPT from "./mpt";
import Cache from "./cache";
import UtilsEventEmitter from "./events";

class Utils {
	public readonly cache = new Cache();
	public readonly mpt = new MPT();
	public readonly events = new UtilsEventEmitter();
}

export default new Utils();
