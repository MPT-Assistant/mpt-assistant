import { Type } from "@sinclair/typebox";
import { WeekLegend } from "./schedule";

const TeachersGetByNameQueryParams = Type.Object({
    name: Type.String()
});

const TeachersGetListQueryParams = Type.Object({
    extended: Type.Optional(
        Type.Union([
            Type.Literal("true"),
            Type.Literal("false")
        ])
    )
});

const TeacherGetScheduleQueryParams = Type.Object({
    date: Type.Optional(Type.String()),
    teacher: Type.String()
});

const Teacher = Type.Object({
    name: Type.String(),
    surname: Type.String(),
    patronymic: Type.String(),
    photo: Type.String(),
    link: Type.Optional(Type.String()),
    dosieId: Type.Optional(Type.String()),
    vkId: Type.Optional(Type.Number()),
    rating: Type.Number()
});

const TeacherScheduleLesson = Type.Object({
    place: Type.String(),
    group: Type.Array(Type.String()),
    num: Type.Number()
});

const TeacherSchedule = Type.Object({
    week: WeekLegend,
    lessons: Type.Array(TeacherScheduleLesson)
});

export {
    TeachersGetByNameQueryParams,
    TeachersGetListQueryParams,
    TeacherGetScheduleQueryParams,
    Teacher,
    TeacherSchedule
};
