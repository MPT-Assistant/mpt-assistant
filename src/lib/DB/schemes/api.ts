import { createSchema, Type } from "ts-mongoose";

const lessonSchema = createSchema(
	{
		num: Type.number({ required: true }),
		name: Type.array({ required: true }).of(Type.string({ required: true })),
		teacher: Type.array({ required: true }).of(Type.string({ required: true })),
	},
	{ _id: false },
);

const daySchema = createSchema(
	{
		num: Type.number({ required: true }),
		place: Type.string({ required: true }),
		lessons: Type.array({ required: true }).of(lessonSchema),
	},
	{ _id: false },
);

const groupSchema = createSchema(
	{
		name: Type.string({ required: true, unique: true }),
		specialty: Type.string({ required: true }),
		schedule: Type.array({ required: true }).of(daySchema),
	},
	{ versionKey: false },
);

const specialtySiteItemSchema = createSchema(
	{
		name: Type.string({ required: true }),
		url: Type.string({ required: true }),
		date: Type.date({ required: true }),
	},
	{ _id: false },
);

const specialtyGroupLeaderSchema = createSchema(
	{
		name: Type.string({ required: true }),
		roles: Type.array({ required: true }).of(
			createSchema(
				{
					photo: Type.string({ required: true }),
					role: Type.string({ required: true }),
					name: Type.string({ required: true }),
				},
				{ _id: false },
			),
		),
	},
	{ _id: false },
);

const specialtySchema = createSchema(
	{
		name: Type.string({ required: true }),
		code: Type.string({ required: true, unique: true }),
		url: Type.string({ required: true }),
		importantInformation: Type.array({ required: true }).of(
			specialtySiteItemSchema,
		),
		news: Type.array({ required: true }).of(specialtySiteItemSchema),
		examQuestions: Type.array({ required: true }).of(specialtySiteItemSchema),
		groupsLeaders: Type.array({ required: true }).of(
			specialtyGroupLeaderSchema,
		),
	},
	{ versionKey: false },
);

const replacementSchema = createSchema(
	{
		date: Type.date({ required: true }),
		group: Type.string({ required: true }),
		detected: Type.date({ required: true }),
		addToSite: Type.date({ required: true }),
		lessonNum: Type.number({ required: true }),
		oldLessonName: Type.string({ required: true }),
		oldLessonTeacher: Type.string({ required: true }),
		newLessonName: Type.string({ required: true }),
		newLessonTeacher: Type.string({ required: true }),
		hash: Type.string({ required: true, unique: true }),
	},
	{ versionKey: false },
);

export default {
	specialtySchema,
	groupSchema,
	replacementSchema,
};
