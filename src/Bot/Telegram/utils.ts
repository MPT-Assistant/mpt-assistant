import Telegram from ".";
import { PromptManager } from "@puregram/prompt";

import { manager as textCommandsManager } from "./TextCommand";
import { manager as callbackCommandsManager } from "./CallbackCommand";
import { IChat, IUser } from "../../lib/DB/Telegram/types";
import DB from "../../lib/DB";
import { InlineKeyboard } from "puregram";
import moment from "moment";
import { TelegramInlineKeyboardButton } from "puregram/generated";

import internalUtils from "../../lib/utils";
import utils from "@rus-anonym/utils";
import { IReplacement } from "../../lib/DB/API/types";

class TelegramUtils {
    private readonly _bot: Telegram;
    public readonly promptManager: PromptManager;
    public readonly textCommands: typeof textCommandsManager;
    public readonly callbackCommands: typeof callbackCommandsManager;

    constructor(bot: Telegram) {
        this._bot = bot;

        this.promptManager = new PromptManager();
        this.textCommands = textCommandsManager;
        this.callbackCommands = callbackCommandsManager;
    }

    public async getUserData(
        id: number,
    ): Promise<IUser> {
        const user = await DB.telegram.models.users.findOne({ id });
        if (user === null) {
            const newUser = await DB.telegram.models.users.create({
                id,
                mailings: { replacements: true },
                regDate: new Date(),
            });
            return newUser;
        }
        return user;
    }

    public async getChatData(
        id: number,
    ): Promise<IChat> {
        const chat = await DB.telegram.models.chats.findOne({ id, });
        if (chat === null) {
            const newChat = DB.telegram.models.chats.create({
                id,
                mailings: { replacements: true, },
            });
            return newChat;
        }
        return chat;
    }

    public generateKeyboard(
        cmd: "lessons" | "replacements",
    ): TelegramInlineKeyboardButton[][] {
        return [
            [
                InlineKeyboard.textButton({
                    text: "ПН",
                    payload: {
                        cmd,
                        date: internalUtils.rest.getNextSelectDay("понедельник"),
                    },
                }),
                InlineKeyboard.textButton({
                    text: "ВТ",
                    payload: {
                        cmd,
                        date: internalUtils.rest.getNextSelectDay("вторник"),
                    },
                }),
                InlineKeyboard.textButton({
                    text: "СР",
                    payload: {
                        cmd,
                        date: internalUtils.rest.getNextSelectDay("среда"),
                    },
                }),
            ],
            [
                InlineKeyboard.textButton({
                    text: "ЧТ",
                    payload: {
                        cmd,
                        date: internalUtils.rest.getNextSelectDay("четверг"),
                    },
                }),
                InlineKeyboard.textButton({
                    text: "ПТ",
                    payload: {
                        cmd,
                        date: internalUtils.rest.getNextSelectDay("пятница"),
                    },
                }),
                InlineKeyboard.textButton({
                    text: "СБ",
                    payload: {
                        cmd,
                        date: internalUtils.rest.getNextSelectDay("суббота"),
                    },
                }),
            ],
            [
                InlineKeyboard.textButton({
                    text: "Вчера",
                    payload: {
                        cmd,
                        date: moment().subtract(1, "day").format("DD.MM.YYYY"),
                    },
                }),
                InlineKeyboard.textButton({
                    text: "Завтра",
                    payload: {
                        cmd,
                        date: moment().add(1, "day").format("DD.MM.YYYY"),
                    },
                }),
            ],
        ];
    }

    public scheduleToString({
        lessons,
        place,
        week,
        replacements,
        selectedDate,
        groupName,
    }: Awaited<ReturnType<typeof internalUtils["mpt"]["getGroupSchedule"]>> & {
        selectedDate: moment.Moment;
        groupName: string;
    }): string {
        const selectedDayName = selectedDate
            .locale("ru")
            .format("dddd")
            .split("");
        selectedDayName[0] = selectedDayName[0].toUpperCase();

        let responseLessonsText = "";

        for (const lesson of lessons) {
            responseLessonsText += `${
                lesson.timetable.start.format("HH:mm:ss") +
                " - " +
                lesson.timetable.end.format("HH:mm:ss")
            }\n${lesson.num}. ${lesson.name} (${lesson.teacher})\n\n`;
        }

        return `расписание на ${selectedDate.format("DD.MM.YYYY")}:
Группа: ${groupName}
День: ${selectedDayName.join("")}
Место: ${place}
Неделя: ${week}

${responseLessonsText}
${
    replacements.length !== 0
        ? `\nВнимание:\nНа выбранный день есть ${utils.string.declOfNum(
            replacements.length,
            ["замена", "замены", "замены"]
        )}.\nПросмотреть текущие замены можно командой "замены".`
        : ""
}`;
    }

    public replacementsToString({
        replacements,
        groupName,
        selectedDate,
    }: {
        replacements: IReplacement[];
        groupName: string;
        selectedDate: moment.Moment;
    }): string {
        let responseReplacementsText = "";
        for (let i = 0; i < replacements.length; ++i) {
            const replacement = replacements[i];
            responseReplacementsText += `Замена #${Number(i) + 1}:
Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
        "HH:mm:ss | DD.MM.YYYY"
    )}
Обнаружена ботом: ${moment(replacement.detected).format(
        "HH:mm:ss | DD.MM.YYYY"
    )}\n\n`;
        }

        return `на выбранный день ${selectedDate.format(
            "DD.MM.YYYY"
        )} для группы ${groupName} ${utils.string.declOfNum(
            replacements.length,
            ["найдена", "найдено", "найдено"]
        )} ${replacements.length} ${utils.string.declOfNum(
            replacements.length,
            ["замена", "замены", "замен"]
        )}:\n\n${responseReplacementsText}`;
    }
}

export default TelegramUtils;
