import UtilsMPT from "./mpt/index";
import UtilsCache from "./cache";
import UtilsEventEmitter from "./events";
import UtilsVK from "./vk/index";

class Utils {
	public readonly cache = new UtilsCache();
	public readonly mpt = new UtilsMPT();
	public readonly events = new UtilsEventEmitter();

	public readonly vk = new UtilsVK();
}

export default new Utils();
