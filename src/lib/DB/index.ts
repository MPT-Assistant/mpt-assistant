import API from "./API";
import VK from "./VK";
import Telegram from "./Telegram";

import config from "../../DB/config";
import timetable from "../../DB/timetable";

class DBManager {
	public readonly api = new API("API");
	public readonly vk = new VK("vk");
	public readonly telegram = new Telegram("telegram");

	public readonly timetable = timetable;
	public readonly config = config;
}

export default new DBManager();
