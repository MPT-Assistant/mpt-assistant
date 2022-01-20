import { Static, Type } from "@sinclair/typebox";

const Week = Type.Object({
	date: Type.Number(),
	week: Type.String(),
	isNumerator: Type.Boolean(),
	isDenominator: Type.Boolean(),
});

const ScheduleGetWeekQueryParams = Type.Object({
	date: Type.Optional(Type.Number()),
});

type TWeek = Static<typeof Week>;
type TScheduleGetWeekQueryParams = Static<typeof ScheduleGetWeekQueryParams>;

export { Week, ScheduleGetWeekQueryParams, TWeek, TScheduleGetWeekQueryParams };
