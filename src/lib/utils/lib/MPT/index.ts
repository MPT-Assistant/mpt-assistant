import moment from "moment";
import "moment-precise-range-plugin";

import utils from "@rus-anonym/utils";

import timetable from "../../../../DB/timetable";
import DB from "../../../DB";
import { IGroup } from "../../../DB/API/types";

interface ITimetableItem {
    status: "await" | "process" | "finished";
    type: "lesson" | "recess";
    num: number;
    start: moment.Moment;
    end: moment.Moment;
    diffStart: moment.PreciseRangeValueObject;
    diffEnd: moment.PreciseRangeValueObject;
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
}

export default MPT;
