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

export { IUser };
