import { createSchema, Type } from "ts-mongoose";

const userSchema = createSchema(
	{
		id: Type.string({ required: true, unique: true }),
		ban: Type.boolean({ required: true }),
		group: Type.string({ required: true }),
		inform: Type.boolean({ required: true }),
		reportedReplacements: Type.array({ required: true }).of(
			Type.string({ required: true }),
		),
		regDate: Type.date({ required: true }),
	},
	{ versionKey: false },
);

const channelSchema = createSchema(
	{
		id: Type.string({ required: true, unique: true }),
		group: Type.string({ required: true }),
		inform: Type.boolean({ required: true }),
		reportedReplacements: Type.array({ required: true }).of(
			Type.string({ required: true }),
		),
	},
	{ versionKey: false },
);

const guildSchema = createSchema(
	{
		id: Type.string({ required: true, unique: true }),
		group: Type.string({ required: true }),
	},
	{ versionKey: false },
);

export default { userSchema, channelSchema, guildSchema };
