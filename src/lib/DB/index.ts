import API from "./API";
import VK from "./VK";

import config from "../../DB/config";
import timetable from "../../DB/timetable";

class DBManager {
	public readonly api = new API("api");
	public readonly vk = new VK("vk");

	public readonly timetable = timetable;
	public readonly config = config;
}

export default new DBManager();
