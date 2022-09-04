import moment from "moment";
import "moment-precise-range-plugin";

import timetable from "../../../DB/timetable";

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

            start.set("hour", element.start.hour);
            start.set("minute", element.start.minute);
            start.set("second", 0);
            start.set("millisecond", 0);

            end.set("hour", element.end.hour);
            end.set("minute", element.end.minute);
            end.set("second", 0);
            end.set("millisecond", 0);

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
}

export default MPT;
