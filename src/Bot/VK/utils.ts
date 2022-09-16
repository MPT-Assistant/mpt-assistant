import { Manager } from "@rus-anonym/commands-manager";
import utils from "@rus-anonym/utils";
import moment from "moment";
import {
    Keyboard, KeyboardBuilder, getRandomId
} from "vk-io";
import DB from "../../lib/DB";
import { IReplacement } from "../../lib/DB/API/types";
import { IChat, IUser } from "../../lib/DB/VK/types";
import internalUtils from "../../lib/utils";

import VK from "./";
import TextCommand, { TRegExpCommandFunc, manager as textCommandsManager } from "./TextCommand";

class UtilsVK {
    private readonly _bot: VK;
    public readonly textCommands: Manager<TextCommand, TRegExpCommandFunc>;

    constructor(bot: VK) {
        this._bot = bot;
        this.textCommands = textCommandsManager;
    }

    public async getUserData(
        id: number,
    ): Promise<IUser> {
        const userData = await DB.vk.models.users.findOne({ id });
        if (userData === null) {
            const response = await this._bot.instance.api.users.get({ user_id: id.toString() });
            const userInfo = response[0] as { first_name: string };
            const newUser = await DB.vk.models.users.create({
                id,
                nickname: userInfo.first_name,
                mailings: { replacements: true },
                regDate: new Date(),
            });
            return newUser;
        }
        return userData;
    }

    public async getChatData(
        id: number,
    ): Promise<IChat> {
        const chatData = await DB.vk.models.chats.findOne({ id });
        if (!chatData) {
            const newChatData = await DB.vk.models.chats.create({
                id,
                mailings: { replacements: true },
            });
            return newChatData;
        }
        return chatData;
    }

    public generateKeyboard(
        command: "lessons" | "replacements",
    ): KeyboardBuilder {
        const builder = Keyboard.builder().inline();

        builder.callbackButton({
            label: "ПН",
            payload: {
                cmd: command,
                date: internalUtils.rest.getNextSelectDay("понедельник"),
            },
            color: Keyboard.SECONDARY_COLOR,
        });
        builder.callbackButton({
            label: "ВТ",
            payload: {
                cmd: command,
                date: internalUtils.rest.getNextSelectDay("вторник"),
            },
            color: Keyboard.SECONDARY_COLOR,
        });
        builder.callbackButton({
            label: "СР",
            payload: {
                cmd: command,
                date: internalUtils.rest.getNextSelectDay("среда"),
            },
            color: Keyboard.SECONDARY_COLOR,
        });
        builder.row();
        builder.callbackButton({
            label: "ЧТ",
            payload: {
                cmd: command,
                date: internalUtils.rest.getNextSelectDay("четверг"),
            },
            color: Keyboard.SECONDARY_COLOR,
        });
        builder.callbackButton({
            label: "ПТ",
            payload: {
                cmd: command,
                date: internalUtils.rest.getNextSelectDay("пятница"),
            },
            color: Keyboard.SECONDARY_COLOR,
        });
        builder.callbackButton({
            label: "СБ",
            payload: {
                cmd: command,
                date: internalUtils.rest.getNextSelectDay("суббота"),
            },
            color: Keyboard.SECONDARY_COLOR,
        });
        builder.row();
        builder.callbackButton({
            label: "Вчера",
            payload: {
                cmd: command,
                date: moment().subtract(1, "day").format("DD.MM.YYYY"),
            },
            color: Keyboard.NEGATIVE_COLOR,
        });
        builder.callbackButton({
            label: "Завтра",
            payload: {
                cmd: command,
                date: moment().add(1, "day").format("DD.MM.YYYY"),
            },
            color: Keyboard.POSITIVE_COLOR,
        });

        return builder;
    }

    public scheduleToString({
        lessons, place, week, replacements, selectedDate, groupName
    }: Awaited<ReturnType<typeof internalUtils["mpt"]["getGroupSchedule"]>> & {selectedDate: moment.Moment; groupName: string}): string {
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
            ["замена", "замены", "замены"],
        )}.\nПросмотреть текущие замены можно командой "замены".`
        : ""
}`;
    }

    public replacementsToString({
        replacements, groupName, selectedDate
    }: {replacements: IReplacement[]; groupName: string; selectedDate: moment.Moment}): string {
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
        "HH:mm:ss | DD.MM.YYYY",
    )}
Обнаружена ботом: ${moment(replacement.detected).format(
        "HH:mm:ss | DD.MM.YYYY",
    )}\n\n`;
        }

        return `на выбранный день ${selectedDate.format(
            "DD.MM.YYYY",
        )} для группы ${groupName} ${utils.string.declOfNum(replacements.length, [
            "найдена",
            "найдено",
            "найдено",
        ])} ${replacements.length} ${utils.string.declOfNum(replacements.length, [
            "замена",
            "замены",
            "замен",
        ])}:\n\n${responseReplacementsText}`;
    }

    public async sendReplacement(
        replacement: IReplacement,
    ): Promise<void> {
        const replacementDate = moment(replacement.date).format("DD.MM.YYYY");
        const message = `Обнаружена новая замена на ${replacementDate}
Группа: ${replacement.group}
Пара: ${replacement.lessonNum}
Заменяемая пара: ${replacement.oldLessonName}
Преподаватель: ${replacement.oldLessonTeacher}
Новая пара: ${replacement.newLessonName}
Преподаватель на новой паре: ${replacement.newLessonTeacher}
Добавлена на сайт: ${moment(replacement.addToSite).format(
        "HH:mm:ss | DD.MM.YYYY",
    )}
Обнаружена ботом: ${moment(replacement.detected).format(
        "HH:mm:ss | DD.MM.YYYY",
    )}`;

        const keyboard = Keyboard.builder().inline();
        keyboard.textButton({
            label: `Расписание ${replacementDate}`,
            payload: { cmd: `Расписание ${replacementDate}`, },
            color: Keyboard.SECONDARY_COLOR,
        });
        keyboard.row();
        keyboard.textButton({
            label: `Замены ${replacementDate}`,
            payload: { cmd: `Замены ${replacementDate}`, },
            color: Keyboard.SECONDARY_COLOR,
        });
        keyboard.row();
        keyboard.textButton({
            label: "Отключить рассылку",
            payload: { cmd: "Изменения отключить", },
            color: Keyboard.NEGATIVE_COLOR,
        });

        const userQuery = {
            group: replacement.group,
            "mailings.replacements": true,
            reportedReplacements: { $nin: [replacement.hash] },
        };

        for await (const user of DB.vk.models.users.find(userQuery)) {
            if (!user.reportedReplacements) {
                user.reportedReplacements = [replacement.hash];
            } else {
                user.reportedReplacements.push(replacement.hash);
            }
            user.markModified("reportedReplacements");

            try {
                await this._bot.instance.api.messages.send({
                    user_id: user.id,
                    random_id: getRandomId(),
                    message,
                    keyboard,
                });
            } catch (error) {
                user.mailings.replacements = false;
            }

            await user.save();
        }

        const chatQuery = {
            group: replacement.group,
            "mailings.replacements": true,
            reportedReplacements: { $nin: [replacement.hash] },
        };

        for await (const chat of DB.vk.models.chats.find(chatQuery)) {
            if (!chat.reportedReplacements) {
                chat.reportedReplacements = [replacement.hash];
            } else {
                chat.reportedReplacements.push(replacement.hash);
            }
            chat.markModified("reportedReplacements");

            try {
                await this._bot.instance.api.messages.send({
                    chat_id: chat.id,
                    random_id: getRandomId(),
                    message,
                    keyboard,
                });
            } catch (error) {
                chat.mailings.replacements = false;
            }

            await chat.save();
        }
    }
}

export default UtilsVK;
