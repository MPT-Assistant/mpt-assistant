import moment from "moment";
import "moment-precise-range-plugin";
import SHA512 from "crypto-js/sha512";

import utils from "@rus-anonym/utils";

import timetable from "../../../DB/timetable";
import DB from "../../DB";
import {
    ICache, ISpecialty as IDataBaseSpecialty, IGroup, IReplacement
} from "../../DB/API/types";
import Cache from "../../Cache";
import internal from "../";
import { ISpecialty } from "@mpt-assistant/parser/dist/types/specialties";

interface ITimetableItem {
    status: "await" | "process" | "finished";
    type: "lesson" | "recess";
    num: number;
    start: moment.Moment;
    end: moment.Moment;
    diffStart: moment.PreciseRangeValueObject;
    diffEnd: moment.PreciseRangeValueObject;
}

interface ILesson {
    num: number;
    name: string;
    teacher: string;
    timetable: ITimetableItem;
}

class Timetable {
    public readonly list: ITimetableItem[];

    constructor(list: ITimetableItem[]) {
        this.list = list;
    }

    public get current(): ITimetableItem | null {
        const now = Date.now();
        const current = this.list.find((item) => {
            return item.start.isSameOrBefore(now) && item.end.isSameOrAfter(now);
        });
        return current || null;
    }

    public get next(): ITimetableItem | null {
        const now = Date.now();
        const next = this.list.find((item) => {
            return item.start.isAfter(now);
        });
        return next || null;
    }
}


class MPT {
    public getTimetable(date: moment.MomentInput = Date.now()): Timetable {
        const list: ITimetableItem[] = [];
        date = moment(date);

        for (const element of timetable) {
            let status: ITimetableItem["status"];

            const start = moment(date);
            const end = moment(date);

            start.set({
                hour: element.start.hour,
                minute: element.start.minute,
                second: 0,
                millisecond: 0
            });

            end.set({
                hour: element.end.hour,
                minute: element.end.minute,
                second: 0,
                millisecond: 0
            });

            if (date > start && date < end) {
                status = "process";
            } else if (date > start && date > end) {
                status = "finished";
            } else {
                status = "await";
            }

            const diffStart = moment.preciseDiff(date, start, true);
            const diffEnd = moment.preciseDiff(date, end, true);

            list.push({
                status,
                type: element.type,
                num: element.num,
                start,
                end,
                diffStart,
                diffEnd,
            });
        }

        return new Timetable(list);
    }

    public async findGroup(
        groupName: string,
    ): Promise<IGroup | string[]> {
        const selectedGroup = await DB.api.models.groups.findOne({ name: new RegExp(
            `^${utils.regular.escapeRegExp(groupName)}$`,
            "i",
        ), });

        if (!selectedGroup) {
            const diff: { group: string; diff: number }[] = [];

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const groupsList = (await DB.api.models.groups.distinct("name")) as string[];
            groupsList.map(group => {
                diff.push({
                    group: group,
                    diff: utils.string.levenshtein(groupName, group, { replaceCase: 0, }),
                });
            });
            diff.sort(function (a, b) {
                if (a.diff > b.diff) {
                    return 1;
                }
                if (a.diff < b.diff) {
                    return -1;
                }
                return 0;
            });

            return diff.slice(0, 3).map((x) => x.group);
        } else {
            return selectedGroup;
        }
    }

    public async getExtendGroupInfo(groupName: string): Promise<{
		group: IGroup;
		specialty: IDataBaseSpecialty;
	}> {
        const group = await DB.api.models.groups.findOne({ name: groupName, });

        if (!group) {
            throw new Error(`Group not found: ${groupName}`);
        }

        const specialty = await DB.api.models.specialties.findOne({ code: group.specialty, });

        if (!specialty) {
            throw new Error(`Specialty not found: ${group.specialty}`);
        }

        return {
            group, specialty
        };
    }

    public async getGroupSchedule(
        group: IGroup,
        selectedDate: moment.Moment = moment(),
    ): Promise<{
		place: string;
		week: ICache["week"];
		lessons: ILesson[];
		replacements: IReplacement[];
		timetable: ITimetableItem[];
	}> {
        const replacements = await DB.api.models.replacements.find({
            group: group.name,
            date: {
                $gte: selectedDate.startOf("day").toDate(),
                $lte: selectedDate.endOf("day").toDate(),
            },
        });

        const schedule = group.schedule.find(
            (day) => day.num === selectedDate.day(),
        );

        const place = schedule ? schedule.place : "Не указано";
        const week = this.getWeekLegend(selectedDate);
        const { list: timetableList } = this.getTimetable(selectedDate);

        const lessons: ILesson[] = [];

        if (schedule) {
            for (const lesson of schedule.lessons) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const timetable = timetableList.find(
                    (x) => x.type === "lesson" && x.num === lesson.num,
                )!;

                if (lesson.name.length === 1) {
                    lessons.push({
                        num: lesson.num,
                        name: lesson.name[0],
                        teacher: lesson.teacher[0],
                        timetable,
                    });
                } else {
                    if (lesson.name[0] !== "-" && week === "Числитель") {
                        lessons.push({
                            num: lesson.num,
                            name: lesson.name[0],
                            teacher: lesson.teacher[0],
                            timetable,
                        });
                    } else if (lesson.name[1] !== "-" && week === "Знаменатель") {
                        lessons.push({
                            num: lesson.num,
                            name: lesson.name[1] as string,
                            teacher: lesson.teacher[1] as string,
                            timetable,
                        });
                    }
                }
            }
        }

        if (replacements.length !== 0) {
            for (const replacement of replacements) {
                const currentLesson = lessons.find(
                    (lesson) => lesson.num === replacement.lessonNum,
                );

                if (!currentLesson) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const timetable = timetableList.find(
                        (x) => x.type === "lesson" && x.num === replacement.lessonNum,
                    )!;
                    lessons.push({
                        num: replacement.lessonNum,
                        name: replacement.newLessonName,
                        teacher: replacement.newLessonTeacher,
                        timetable,
                    });
                } else {
                    currentLesson.name = replacement.newLessonName;
                    currentLesson.teacher = replacement.newLessonTeacher;
                }
            }

            lessons.sort((firstLesson, secondLesson) => {
                if (firstLesson.num > secondLesson.num) {
                    return 1;
                } else if (firstLesson.num < secondLesson.num) {
                    return -1;
                } else {
                    return 0;
                }
            });
        }

        return {
            place,
            week,
            lessons,
            replacements,
            timetable: timetableList,
        };
    }

    public async getGroupReplacements(
        groupName: string,
        selectedDate: moment.Moment = moment(),
    ): Promise<IReplacement[]> {
        const replacements = await DB.api.models.replacements.find({
            group: groupName,
            date: {
                $gte: selectedDate.startOf("day").toDate(),
                $lte: selectedDate.endOf("day").toDate(),
            },
        });

        return replacements;
    }

    public getWeekLegend(selectedDate: moment.Moment = moment()): ICache["week"] {
        const lastUpdateWeek = moment(Cache.lastUpdate).week();
        const selectedWeek = selectedDate.week();
        if (lastUpdateWeek % 2 === selectedWeek % 2) {
            return Cache.week.isNumerator
                ? "Числитель"
                : "Знаменатель";
        } else {
            return Cache.week.isNumerator
                ? "Знаменатель"
                : "Числитель";
        }
    }

    public async updateSchedule(): Promise<void> {
        const schedule = await internal.parser.getSchedule();
        const specialties = await internal.parser.getSpecialtiesList();

        for (const specialty of schedule) {
            for (const group of specialty.groups) {
                let accurateSpecialty = specialties.find(
                    (x) => x.code === specialty.name,
                );

                if (!accurateSpecialty) {
                    const [groupSpecialtyCode] = group.name.match(
                        /[А-Я]+/i,
                    ) as RegExpMatchArray;

                    accurateSpecialty = specialties.find(
                        (x) => x.code === specialty.name + `(${groupSpecialtyCode})`,
                    ) as ISpecialty;
                }

                const response = await DB.api.models.groups.updateOne(
                    { name: group.name },
                    {
                        name: group.name,
                        specialty: accurateSpecialty.code,
                        schedule: group.days,
                    },
                );

                if (response.matchedCount === 0) {
                    await DB.api.models.groups.insertMany({
                        name: group.name,
                        specialty: accurateSpecialty.code,
                        schedule: group.days,
                    });
                }
            }
        }

        for (const specialty of specialties) {
            const advancedSpecialtyInfo = await internal.parser.getSpecialtySite(
                specialty.name,
                specialties,
            );

            const response = await DB.api.models.specialties.updateOne(
                { code: advancedSpecialtyInfo.code, },
                advancedSpecialtyInfo,
            );

            if (response.matchedCount === 0) {
                await DB.api.models.specialties.insertMany(advancedSpecialtyInfo);
            }
        }
    }

    public async updateReplacementsList(): Promise<void> {
        const replacements = await internal.parser.getReplacements();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const groupList = (await DB.api.models.groups.distinct("name")) as string[];
        const insertedDocuments = [];

        for (const dayReplacements of replacements) {
            const date = dayReplacements.date;
            for (const groupReplacements of dayReplacements.groups) {
                const groupRegExp = new RegExp(groupReplacements.group, "i");
                const groupName =
					groupList.find((x) => groupRegExp.test(x)) || groupReplacements.group;

                for (const replacement of groupReplacements.replacements) {
                    const hash = this._createReplacementHash({
                        date,
                        group: groupName,
                        lessonNum: replacement.num,
                        oldLessonName: replacement.old.name,
                        oldLessonTeacher: replacement.old.teacher,
                        newLessonName: replacement.new.name,
                        newLessonTeacher: replacement.new.teacher,
                    });

                    insertedDocuments.push({
                        date: new Date(date),
                        group: groupName,
                        detected: new Date(),
                        addToSite: new Date(replacement.created),
                        lessonNum: replacement.num,
                        oldLessonName: replacement.old.name,
                        oldLessonTeacher: replacement.old.teacher,
                        newLessonName: replacement.new.name,
                        newLessonTeacher: replacement.new.teacher,
                        hash: hash,
                    });
                }
            }
        }

        const response = await DB.api.models.replacements
            .insertMany(insertedDocuments, { ordered: false, })
            .catch((err) => {
                if (Object.prototype.hasOwnProperty.call(err, "insertedDocs")) {
                    (
                        (err as {insertedDocs: IReplacement[]}).insertedDocs
                    ).map(internal.events.emitReplacement.bind(internal.events));
                }
            });

        if (response) {
            response.map(internal.events.emitReplacement.bind(internal.events));
        }
    }

    private _createReplacementHash({
        date,
        group,
        lessonNum,
        oldLessonName,
        oldLessonTeacher,
        newLessonName,
        newLessonTeacher,
    }: {
		date: moment.MomentInput;
		group: string;
		lessonNum: number;
		oldLessonName: string;
		oldLessonTeacher: string;
		newLessonName: string;
		newLessonTeacher: string;
	}): string {
        const props = [
            moment(date).format("DD.MM.YYYY"),
            group,
            lessonNum,
            oldLessonName,
            oldLessonTeacher,
            newLessonName,
            newLessonTeacher,
        ];
        return SHA512(props.join("|")).toString();
    }
}

export default MPT;
