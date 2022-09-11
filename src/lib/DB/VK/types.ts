interface IUser {
    id: number;
    nickname?: string;
    group?: string;
    mailings: {
        replacements: boolean;
    };
    regDate: Date;
    reportedReplacements?: string[];
}

interface IChat {
    id: number;
    group?: string;
    mailings: {
        replacements: boolean;
    };
    officeSchedule?: {
        date: Date;
        image: string;
        userId: number;
    };
    reportedReplacements?: string[];
}

export { IUser, IChat };
