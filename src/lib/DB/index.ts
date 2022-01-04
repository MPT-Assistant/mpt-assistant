import API from "./API";
import VK from "./VK";

class DBManager {
	public readonly api = new API("api");
	public readonly vk = new VK("vk");
}

export default new DBManager();
