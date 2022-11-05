import { Type } from "@sinclair/typebox";

const ScheduleGetQueryParams = Type.Object({
    group: Type.String(),
    date: Type.Optional(Type.String()),
});

const ScheduleGetWeekQueryParams = Type.Object({
    group: Type.String(),
});

const ScheduleGetWeekLegendQueryParams = Type.Object({
    date: Type.Optional(Type.String()),
});

const WeekLegend = Type.Object({
    date: Type.String(),
    value: Type.String(),
    isNumerator: Type.Boolean(),
    isDenominator: Type.Boolean(),
});

const Lesson = Type.Object({
    name: Type.String(),
    teacher: Type.String(),
    num: Type.Number()
});

const ExtendedLesson = Type.Intersect([
    Lesson,
    Type.Object({
        start: Type.String(),
        end: Type.String(),
    })
]);

const Replacement = Type.Object({
    detected: Type.Number(),
    addToSite: Type.Number(),
    oldLessonName: Type.String(),
    oldLessonTeacher: Type.String(),
    newLessonName: Type.String(),
    newLessonTeacher: Type.String(),
});

const Schedule = Type.Object({
    place: Type.String(),
    week: WeekLegend,
    lessons: Type.Array(ExtendedLesson),
    replacements: Type.Optional(Type.Array(Replacement)),
});

const WeekDaySchedule = Type.Object({
    num: Type.Number(),
    place: Type.String(),
    lessons: Type.Array(Lesson),
});

const WeekSchedule = Type.Array(WeekDaySchedule);

const WeekScheduleResponse = Type.Object({
    numerator: WeekSchedule,
    denominator: WeekSchedule,
});

export {
    ScheduleGetQueryParams,
    ScheduleGetWeekQueryParams,
    ScheduleGetWeekLegendQueryParams,
    WeekLegend,
    Schedule,
    WeekSchedule,
    WeekScheduleResponse
};
