interface IReplacement {
    date: Date;
    group: string;
    detected: Date;
    addToSite: Date;
    lessonNum: number;
    oldLessonName: string;
    oldLessonTeacher: string;
    newLessonName: string;
    newLessonTeacher: string;
    hash: string;
}

export { IReplacement };
