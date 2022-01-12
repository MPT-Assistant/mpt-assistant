import parser from "../parser";
import DB from "../DB";

class UtilsCacheMPT {
	public week: MPT.Week = "Числитель";
	public lastUpdate: Date = new Date();

	public isScheduleNotAvailable = true;

	public get isNumerator(): boolean {
		return this.week === "Числитель";
	}

	public get isDenominator(): boolean {
		return this.week === "Знаменатель";
	}
}

class UtilsCache {
	public readonly mpt = new UtilsCacheMPT();

	public async updateWeek(): Promise<void> {
		this.mpt.week = await parser.getCurrentWeek();
	}

	public async load(): Promise<void> {
		const serverData = await DB.api.models.cache.findOne({});
		if (serverData) {
			this.mpt.week = serverData.week;
			this.mpt.lastUpdate = serverData.lastUpdate;
		}
	}

	public async save(): Promise<void> {
		await DB.api.models.cache.updateOne(
			{},
			{
				week: this.mpt.week,
				lastUpdate: this.mpt.lastUpdate,
			},
		);
	}
}

export default UtilsCache;
