import { Type } from "@sinclair/typebox";

const ReplacementsGetQueryParams = Type.Object({
    group: Type.Optional(Type.String()),
});

const Replacement = Type.Object({
    date: Type.String(),
    detected: Type.Number(),
    addToSite: Type.Number(),
    group: Type.String(),
    lessonNum: Type.Number(),
    oldLessonName: Type.String(),
    oldLessonTeacher: Type.String(),
    newLessonName: Type.String(),
    newLessonTeacher: Type.String(),
    hash: Type.String()
});

const ReplacementsGetResponse = Type.Array(Replacement);

export {
    ReplacementsGetQueryParams,
    ReplacementsGetResponse
};
