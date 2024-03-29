const timetable = [
    {
        num: 1,
        type: "lesson",
        start: {
            hour: 8,
            minute: 30,
        },
        end: {
            hour: 10,
            minute: 0,
        },
    },
    {
        num: 1,
        type: "recess",
        start: {
            hour: 10,
            minute: 0,
        },
        end: {
            hour: 10,
            minute: 10,
        },
    },
    {
        num: 2,
        type: "lesson",
        start: {
            hour: 10,
            minute: 10,
        },
        end: {
            hour: 11,
            minute: 40,
        },
    },
    {
        num: 2,
        type: "recess",
        start: {
            hour: 11,
            minute: 40,
        },
        end: {
            hour: 12,
            minute: 0,
        },
    },
    {
        num: 3,
        type: "lesson",
        start: {
            hour: 12,
            minute: 0,
        },
        end: {
            hour: 13,
            minute: 30,
        },
    },
    {
        num: 3,
        type: "recess",
        start: {
            hour: 13,
            minute: 30,
        },
        end: {
            hour: 13,
            minute: 50,
        },
    },
    {
        num: 4,
        type: "lesson",
        start: {
            hour: 13,
            minute: 50,
        },
        end: {
            hour: 15,
            minute: 20,
        },
    },
    {
        num: 4,
        type: "recess",
        start: {
            hour: 15,
            minute: 20,
        },
        end: {
            hour: 15,
            minute: 30,
        },
    },
    {
        num: 5,
        type: "lesson",
        start: {
            hour: 15,
            minute: 30,
        },
        end: {
            hour: 17,
            minute: 0,
        },
    },
    {
        num: 5,
        type: "recess",
        start: {
            hour: 17,
            minute: 0,
        },
        end: {
            hour: 17,
            minute: 5,
        },
    },
    {
        num: 6,
        type: "lesson",
        start: {
            hour: 17,
            minute: 5,
        },
        end: {
            hour: 18,
            minute: 35,
        },
    },
    {
        num: 6,
        type: "recess",
        start: {
            hour: 18,
            minute: 35,
        },
        end: {
            hour: 18,
            minute: 40,
        },
    },
    {
        num: 7,
        type: "lesson",
        start: {
            hour: 18,
            minute: 40,
        },
        end: {
            hour: 20,
            minute: 10,
        },
    },
] as const;

export default timetable;
