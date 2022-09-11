import { Schema } from "mongoose";

import { IUser } from "./types";

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
    mailings: userMailingsSchema,
    regDate: {
        type: Schema.Types.Date,
        required: true,
        default: Date.now 
    },
    reportedReplacements: [Schema.Types.String],
});

export default {
    userSchema 
};
