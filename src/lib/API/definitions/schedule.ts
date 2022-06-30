import { Static, Type } from "@sinclair/typebox";
import { Group } from "./groups";

const Week = Type.Object({
	date: Type.String(),
	value: Type.String(),
	isNumerator: Type.Boolean(),
	isDenominator: Type.Boolean(),
});

const ScheduleGetWeekQueryParams = Type.Object({
	date: Type.Optional(Type.String()),
});

const ScheduleLesson = Type.Object({
	num: Type.Number(),
	name: Type.String(),
	teacher: Type.String(),
});

const Schedule = Type.Object({
	week: Week,
	group: Group,
	schedule: Type.Object({
		place: Type.String(),
		lessons: Type.Array(ScheduleLesson),
		hasReplacements: Type.Boolean(),
	}),
});

const ScheduleGetQueryParams = Type.Object({
	group: Type.String(),
	date: Type.Optional(Type.String()),
});

const ScheduleListDay = Type.Object({
	num: Type.Number(),
	place: Type.String(),
	lessons: Type.Array(ScheduleLesson),
});

const ScheduleList = Type.Object({
	numerator: Type.Array(ScheduleListDay),
	denominator: Type.Array(ScheduleListDay),
});

const ScheduleGetListQueryParams = Type.Object({
	group: Type.String(),
});

type TWeek = Static<typeof Week>;
type TScheduleGetWeekQueryParams = Static<typeof ScheduleGetWeekQueryParams>;

type TSchedule = Static<typeof Schedule>;
type TScheduleGetQueryParams = Static<typeof ScheduleGetQueryParams>;

type TScheduleLesson = Static<typeof ScheduleLesson>;
type TScheduleListDay = Static<typeof ScheduleListDay>;
type TScheduleList = Static<typeof ScheduleList>;
type TScheduleGetListQueryParams = Static<typeof ScheduleGetListQueryParams>;

export {
	Week,
	ScheduleGetWeekQueryParams,
	Schedule,
	ScheduleGetQueryParams,
	ScheduleGetListQueryParams,
	TWeek,
	TScheduleGetWeekQueryParams,
	TSchedule,
	TScheduleLesson,
	TScheduleGetQueryParams,
	TScheduleListDay,
	TScheduleList,
	TScheduleGetListQueryParams,
};
