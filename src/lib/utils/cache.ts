import moment from "moment";

import parser from "../parser";
import DB from "../DB";

class UtilsCacheMPT {
	private _week: MPT.Week = "Числитель";

	public get week(): MPT.Week {
		const lastUpdateWeek = moment(this.lastUpdate).week();
		const currentWeek = moment().week();

		if (lastUpdateWeek % 2 === currentWeek % 2) {
			return this._week === "Числитель" ? "Числитель" : "Знаменатель";
		} else {
			return this._week === "Числитель" ? "Знаменатель" : "Числитель";
		}
	}

	public set week(value: MPT.Week) {
		this._week = value;
		this.lastUpdate = new Date();
	}

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
		await this.save();
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
