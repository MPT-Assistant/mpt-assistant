import { Static, Type } from "@sinclair/typebox";

const Replacement = Type.Object({
	date: Type.String(),
	group: Type.String(),
	detected: Type.Number(),
	addToSite: Type.Number(),
	lessonNum: Type.Number(),
	oldLessonName: Type.String(),
	oldLessonTeacher: Type.String(),
	newLessonName: Type.String(),
	newLessonTeacher: Type.String(),
	hash: Type.String(),
});
const ReplacementList = Type.Array(Replacement);

const ReplacementsGetByGroupQueryParams = Type.Object({
	group: Type.String(),
	date: Type.Optional(Type.String()),
});

type TReplacement = Static<typeof Replacement>;
type TReplacementList = Static<typeof ReplacementList>;

type TReplacementsGetByGroupQueryParams = Static<
	typeof ReplacementsGetByGroupQueryParams
>;

export {
	ReplacementList,
	ReplacementsGetByGroupQueryParams,
	TReplacement,
	TReplacementList,
	TReplacementsGetByGroupQueryParams,
};
