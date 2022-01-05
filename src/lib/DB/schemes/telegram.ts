import { createSchema, Type } from "ts-mongoose";

const userSchema = createSchema({
	id: Type.number({ required: true, unique: true }),
	ban: Type.boolean({ required: true }),
	group: Type.string({ required: true }),
	inform: Type.boolean({ required: true }),
	reportedReplacements: Type.array({ required: true }).of(
		Type.string({ required: true }),
	),
	regDate: Type.date({ required: true }),
});

const chatSchema = createSchema({
	id: Type.number({ required: true, unique: true }),
	group: Type.string({ required: true }),
	inform: Type.boolean({ required: true }),
	reportedReplacements: Type.array({ required: true }).of(
		Type.string({ required: true }),
	),
});

export default { userSchema, chatSchema };
