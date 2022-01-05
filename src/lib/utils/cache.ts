import parser from "../parser";

class UtilsCacheMPT {
	public week: MPT.Week = "Числитель";

	get isNumerator(): boolean {
		return this.week === "Числитель";
	}

	get isDenominator(): boolean {
		return this.week === "Знаменатель";
	}
}

class UtilsCache {
	public readonly mpt = new UtilsCacheMPT();

	public async update(): Promise<void> {
		this.mpt.week = await parser.getCurrentWeek();
	}
}

export default UtilsCache;
