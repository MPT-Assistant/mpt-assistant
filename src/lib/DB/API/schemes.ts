import { Schema } from "mongoose";

import {
    ICache,
    IGroup,
    IReplacement,
    IScheduleDay,
    IScheduleLesson,
    ISpecialty,
    ITeacher,
    ITeacherRatingItem
} from "./types";

const cacheSchema = new Schema<ICache>({
    week: {
        type: Schema.Types.String,
        required: true
    },
    lastUpdate: {
        type: Schema.Types.Date,
        required: true
    }
}, { versionKey: false });

const lessonSchema = new Schema<IScheduleLesson>({
    num: {
        type: Schema.Types.Number,
        required: true
    },
    name: {
        type: [Schema.Types.String],
        minlength: 1,
        maxlength: 2,
        required: true
    },
    teacher: {
        type: [Schema.Types.String],
        minlength: 1,
        maxlength: 2,
        required: true
    }
});

const dayScheduleSchema = new Schema<IScheduleDay>({
    num: {
        type: Schema.Types.Number,
        required: true
    },
    place: {
        type: Schema.Types.String,
        required: true
    },
    lessons: {
        type: [lessonSchema],
        required: true
    }
});

const groupSchema = new Schema<IGroup>({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true,
    },
    specialty: {
        type: Schema.Types.String,
        required: true
    },
    schedule: {
        type: [dayScheduleSchema],
        required: true
    }
}, { versionKey: false });

const specialtySchema = new Schema<ISpecialty>({
    name: {
        type: Schema.Types.String,
        required: true,
        unique: true
    },
    code: {
        type: Schema.Types.String,
        required: true,
    },
    url: {
        type: Schema.Types.String,
        required: true
    }
}, { versionKey: false });

const replacementSchema = new Schema<IReplacement>({
    group: {
        type: Schema.Types.String,
        required: true
    },
    hash: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        dropDups: true
    },
    newLessonName: {
        type: Schema.Types.String,
        required: true
    },
    newLessonTeacher: {
        type: Schema.Types.String,
        required: true
    },
    oldLessonName: {
        type: Schema.Types.String,
        required: true
    },
    oldLessonTeacher: {
        type: Schema.Types.String,
        required: true
    },
    lessonNum: {
        type: Schema.Types.Number,
        required: true
    },
    date: {
        type: Schema.Types.Date,
        required: true,
    },
    detected: {
        type: Schema.Types.Date,
        required: true
    },
    addToSite: {
        type: Schema.Types.Date,
        required: true
    },
}, { versionKey: false });

const teacherRatingSchema = new Schema<ITeacherRatingItem>({
    score: {
        type: Schema.Types.Number,
        required: true
    },
    source: {
        type: Schema.Types.Mixed,
        required: true
    }
}, { versionKey: false });

const teacherSchema = new Schema<ITeacher>({
    name: {
        type: Schema.Types.String,
        required: true
    },
    surname: {
        type: Schema.Types.String,
        required: true
    },
    patronymic: {
        type: Schema.Types.String,
        required: true
    },
    link: {
        type: Schema.Types.String,
        required: false
    },
    photo: {
        type: Schema.Types.String,
        required: true
    },
    rating: {
        type: [teacherRatingSchema],
        required: true
    }
}, { versionKey: false });

export default {
    cacheSchema,
    groupSchema,
    specialtySchema,
    replacementSchema,
    teacherSchema
};
