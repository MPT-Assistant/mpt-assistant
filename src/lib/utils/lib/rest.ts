import moment from "moment";

class RestUtils {
    private readonly _dayTemplates = [
        /воскресенье|вс/,
        /понедельник|пн/,
        /вторник|вт/,
        /среда|ср/,
        /четверг|чт/,
        /пятница|пт/,
        /суббота|сб/,
    ] as const;

    public parseSelectedDate(text = ""): moment.Moment {
        let selectedDate: moment.Moment | undefined;
        if (text === "" || /(?:^сегодня|с)$/gi.test(text)) {
            selectedDate = moment();
        } else if (/(?:^завтра|^з)$/gi.test(text)) {
            selectedDate = moment().add(1, "day");
        } else if (/(?:^послезавтра|^пз)$/gi.test(text)) {
            selectedDate = moment().add(2, "day");
        } else if (/(?:^вчера|^в)$/gi.test(text)) {
            selectedDate = moment().subtract(1, "day");
        } else if (/(?:^позавчера|^поз)$/gi.test(text)) {
            selectedDate = moment().subtract(2, "day");
        } else if (/([\d]+)?(.)?([\d]+)?(.)?([\d]+)/.test(text)) {
            selectedDate = moment(text, "DD.MM.YYYY");
        } else {
            for (const templateIndex in this._dayTemplates) {
                const regex = new RegExp(
                    this._dayTemplates[templateIndex],
                    "gi",
                );
                if (regex.test(text) === true) {
                    const currentDate = new Date();
                    const targetDay = Number(templateIndex);
                    const targetDate = new Date();
                    const delta = targetDay - currentDate.getDay();
                    if (delta >= 0) {
                        targetDate.setDate(currentDate.getDate() + delta);
                    } else {
                        targetDate.setDate(currentDate.getDate() + 7 + delta);
                    }
                    selectedDate = moment(targetDate);
                }
            }
        }

        if (!selectedDate) {
            selectedDate = moment();
        }

        return selectedDate;
    }

    public getNextSelectDay(
        day:
            | "понедельник"
            | "вторник"
            | "среда"
            | "четверг"
            | "пятница"
            | "суббота"
            | "воскресенье",
    ): string {
        const selectedDay = this._dayTemplates.findIndex((x) => x.test(day));
        const currentDate = new Date();
        const targetDay = Number(selectedDay);
        const targetDate = new Date();
        const delta = targetDay - currentDate.getDay();
        if (delta >= 0) {
            targetDate.setDate(currentDate.getDate() + delta);
        } else {
            targetDate.setDate(currentDate.getDate() + 7 + delta);
        }
        return moment(targetDate).format("DD.MM.YYYY");
    }
}

export default RestUtils;
