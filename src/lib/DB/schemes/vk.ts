import { createSchema, Type } from "ts-mongoose";

const userSchema = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		nickname: Type.string({ required: true }),
		group: Type.string({ required: true }),
		ban: Type.boolean({ required: true }),
		inform: Type.boolean({ required: true }),
		regDate: Type.date({ required: true }),
		reportedReplacements: Type.array({ required: true }).of(Type.string({})),
	},
	{ versionKey: false },
);

const chatSchema = createSchema(
	{
		id: Type.number({ required: true, unique: true }),
		group: Type.string({ required: true }),
		inform: Type.boolean({ required: true }),
		reportedReplacements: Type.array({ required: true }).of(Type.string({})),
	},
	{ versionKey: false },
);

export default { userSchema, chatSchema };
