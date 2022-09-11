import { Schema } from "mongoose";

import { IUser, IChat } from "./types";

const userMailingsSchema = new Schema<IUser["mailings"]>({
    replacements: {
        type: Schema.Types.Boolean,
        required: true,
        default: true,
    }
});

const userSchema = new Schema<IUser>({
    id: {
        type: Schema.Types.Number,
        required: true 
    },
    group: Schema.Types.String,
    nickname: Schema.Types.String,
    mailings: {
        type: userMailingsSchema,
        required: true,
    },
    regDate: {
        type: Schema.Types.Date,
        required: true,
        default: Date.now 
    },
    reportedReplacements: {
        type: [Schema.Types.String], default: undefined 
    },
});

const chatMailingsSchema = new Schema<IChat["mailings"]>({
    replacements: {
        type: Schema.Types.Boolean,
        required: true,
        default: true,
    }
});

const chatOfficeScheduleSchema = new Schema<IChat["officeSchedule"]>({
    date: {
        type: Schema.Types.Date, required: true 
    },
    image: {
        type: Schema.Types.String, required: true 
    },
    userId: {
        type: Schema.Types.Number, required: true 
    },
});

const chatSchema = new Schema<IChat>({
    id: {
        type: Schema.Types.Number,
        required: true 
    },
    group: Schema.Types.String,
    mailings: {
        type: chatMailingsSchema,
        required: true,
    },
    officeSchedule: chatOfficeScheduleSchema,
    reportedReplacements: {
        type: [Schema.Types.String], default: undefined 
    },
});

export default {
    userSchema,
    chatSchema
};
