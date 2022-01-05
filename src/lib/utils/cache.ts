import parser from "../parser";

class UtilsCache {
	public readonly mpt: {
		week: MPT.Week;
	} = {
		week: "Числитель",
	};

	public async update(): Promise<void> {
		this.mpt.week = await parser.getCurrentWeek();
	}
}

export default UtilsCache;
