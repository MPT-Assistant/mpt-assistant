import { Type } from "@sinclair/typebox";

const ScheduleGetQueryParams = Type.Object({
    group: Type.String(),
    date: Type.Optional(Type.String()),
});

const ScheduleGetWeekQueryParams = Type.Object({
    date: Type.Optional(Type.String()),
});

const Week = Type.Object({
    date: Type.String(),
    value: Type.String(),
    isNumerator: Type.Boolean(),
    isDenominator: Type.Boolean(),
});

const Lesson = Type.Object({
    name: Type.String(),
    teacher: Type.String(),
    num: Type.Number(),
});

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
    week: Week,
    lessons: Type.Array(Lesson),
    replacements: Type.Optional(Type.Array(Replacement)),
});

export {
    ScheduleGetQueryParams,
    ScheduleGetWeekQueryParams,
    Week,
    Schedule
};