import { Static, Type } from "@sinclair/typebox";
import { Group } from "./groups";

const Week = Type.Object({
	date: Type.Number(),
	week: Type.String(),
	isNumerator: Type.Boolean(),
	isDenominator: Type.Boolean(),
});

const ScheduleGetWeekQueryParams = Type.Object({
	date: Type.Optional(Type.Number()),
});

const Schedule = Type.Object({
	week: Week,
	group: Group,
	schedule: Type.Object({
		place: Type.String(),
		lessons: Type.Array(
			Type.Object({
				num: Type.Number(),
				name: Type.String(),
				teacher: Type.String(),
			}),
		),
		hasReplacements: Type.Boolean(),
	}),
});

const ScheduleGetQueryParams = Type.Object({
	name: Type.String(),
	date: Type.Optional(Type.Number()),
});

type TWeek = Static<typeof Week>;
type TScheduleGetWeekQueryParams = Static<typeof ScheduleGetWeekQueryParams>;

type TSchedule = Static<typeof Schedule>;
type TScheduleGetQueryParams = Static<typeof ScheduleGetQueryParams>;

export {
	Week,
	ScheduleGetWeekQueryParams,
	Schedule,
	ScheduleGetQueryParams,
	TWeek,
	TScheduleGetWeekQueryParams,
	TSchedule,
	TScheduleGetQueryParams,
};
