import { Type } from "@sinclair/typebox";

const ScheduleGetWeekQueryParams = Type.Object({
    date: Type.Optional(Type.String()),
});

const Week = Type.Object({
    date: Type.String(),
    value: Type.String(),
    isNumerator: Type.Boolean(),
    isDenominator: Type.Boolean(),
});

export { ScheduleGetWeekQueryParams, Week };
