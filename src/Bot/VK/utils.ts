import moment from "moment";
import { Keyboard, getRandomId } from "vk-io";
import DB from "../../lib/DB";
import { IReplacement } from "../../lib/DB/API/types";
import { IChat, IUser } from "../../lib/DB/VK/types";

import VK from "./";

class UtilsVK {
    constructor(private readonly _bot: VK) {}

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
