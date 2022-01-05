import UtilsMPT from "./mpt/index";
import UtilsCache from "./cache";
import UtilsEventEmitter from "./events";
import UtilsRest from "./rest";

class Utils {
	public readonly cache = new UtilsCache();
	public readonly mpt = new UtilsMPT();
	public readonly events = new UtilsEventEmitter();

	public readonly rest = new UtilsRest();
}

export default new Utils();
