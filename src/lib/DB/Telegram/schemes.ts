import { Schema } from "mongoose";

import { IChat, IUser } from "./types";

const userMailingsSchema = new Schema<IUser["mailings"]>({ replacements: {
    type: Schema.Types.Boolean,
    required: true,
    default: true,
} }, {
    _id: false, versionKey: false
});

const userSchema = new Schema<IUser>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true,
    },
    group: Schema.Types.String,
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
}, { versionKey: false });

const chatMailingsSchema = new Schema<IChat["mailings"]>({ replacements: {
    type: Schema.Types.Boolean,
    required: true,
    default: true,
}, }, {
    _id: false, versionKey: false
});

const chatSchema = new Schema<IChat>({
    id: {
        type: Schema.Types.Number,
        required: true,
        unique: true
    },
    group: Schema.Types.String,
    mailings: {
        type: chatMailingsSchema,
        required: true,
    },
    reportedReplacements: {
        type: [Schema.Types.String], default: undefined
    },
}, { versionKey: false });

export default {
    userSchema,
    chatSchema
};
