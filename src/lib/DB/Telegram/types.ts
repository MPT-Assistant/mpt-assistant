import { Document } from "mongoose";


interface IUser extends Document {
    id: number;
    group?: string;
    mailings: {
        replacements: boolean;
    };
    regDate: Date;
    reportedReplacements?: string[];
}

interface IChat extends Document {
    id: number;
    group?: string;
    mailings: {
        replacements: boolean;
    };
    reportedReplacements?: string[];
}

export { IUser, IChat };
