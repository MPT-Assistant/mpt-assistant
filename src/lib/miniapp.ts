import { Static, Type } from "@sinclair/typebox";
import { API } from "vk-io";
import CryptoJS from "crypto-js";

import config from "../DB/config";
import utils from "@rus-anonym/utils";

const signBox = Type.Object({
    vk_ts: Type.Number(),
    vk_user_id: Type.Number(),
    vk_app_id: Type.Optional(Type.Number()),
    vk_is_app_user: Type.Optional(Type.Boolean()),
    vk_are_notifications_enabled: Type.Optional(Type.Boolean()),
    vk_language: Type.Optional(Type.String()),
    vk_ref: Type.Optional(Type.String()),
    vk_access_token_settings: Type.Optional(Type.String()),
    vk_group_id: Type.Optional(Type.Number()),
    vk_viewer_group_role: Type.Optional(
        Type.Union([
            Type.Literal("none"),
            Type.Literal("member"),
            Type.Literal("moder"),
            Type.Literal("editor"),
            Type.Literal("admin"),
        ])
    ),
    vk_platform: Type.Optional(
        Type.Union([
            Type.Literal("mobile_android"),
            Type.Literal("mobile_iphone"),
            Type.Literal("mobile_web"),
            Type.Literal("desktop_web"),
            Type.Literal("mobile_android_messenger"),
            Type.Literal("mobile_iphone_messenger"),
        ])
    ),
    vk_is_favorite: Type.Optional(Type.Boolean()),
    sign: Type.String(),
});

type TSign = Static<typeof signBox>;

interface ICacheUser {
    type: "user";
    id: number;
    name: string;
    surname: string;
    photo: string;
}

interface ICacheGroup {
    type: "group";
    id: number;
    name: string;
    photo: string;
}

class Miniapp {
    private _cachedUsers: Omit<ICacheUser, "type">[] = [];
    private _cachedGroups: Omit<ICacheGroup, "type">[] = [];

    public readonly api = new API({
        token: config.vk.miniapp.serviceToken,
        apiMode: "parallel",
        language: "ru"
    });

    public parseSign(sign: string, extended = false): TSign {
        const resp: [string, string | number | boolean][] = [];
        const params = new URLSearchParams(sign);
        for (const [key, value] of params.entries()) {
            if (extended) {
                if (signBox.properties[key as keyof TSign] !== undefined) {
                    switch (signBox.properties[key as keyof TSign].type) {
                        case "boolean":
                            resp.push([key, Boolean(Number(value))]);
                            break;
                        case "number":
                            resp.push([key, Number(Number(value))]);
                            break;
                        default:
                            resp.push([key, value]);
                    }
                } else {
                    resp.push([key, value]);
                }
            } else {
                resp.push([key, value]);
            }
        }

        return resp.sort((a, b) => a[0].localeCompare(b[0])).reduce((acc, obj) => {
            acc[obj[0]] = obj[1];
            return acc;
        }, {} as Record<string, string | number | boolean>) as unknown as TSign;
    }

    public isValidSign(sign: string): boolean {
        const params = this.parseSign(sign);
        const vkParams: Record<string, string> = {};

        for (const key in params) {
            if (key.startsWith("vk_")) {
                vkParams[key] = params[key as keyof TSign] as string;
            }
        }

        const paramsSign = CryptoJS.HmacSHA256(
            new URLSearchParams(vkParams).toString(),
            config.vk.miniapp.secureKey
        ).toString(CryptoJS.enc.Base64url);
        return paramsSign === params.sign;
    }

    private async _loadUsersInfo(user_ids: number[]): Promise<Omit<ICacheUser, "type">[]> {
        const response: Omit<ICacheUser, "type">[] = [];

        for (const chunk of utils.array.splitTo(user_ids, 500)) {
            const users = await this.api.users.get({
                user_ids: chunk,
                fields: ["photo_100"]
            });

            response.push(...users.map((user: {
                id: number;
                first_name: string;
                last_name: string;
                photo_100: string;
            }) => ({
                id: user.id,
                name: user.first_name,
                surname: user.last_name,
                photo: user.photo_100
            })));
        }

        return response;
    }

    public async getUsersInfo(user_ids: number[]): Promise<ICacheUser[]> {
        const cachedUsers = this._cachedUsers.filter((user) => user_ids.includes(user.id));
        const uncachedUsers = user_ids.filter(id => cachedUsers.find(user => user.id === id) === undefined);

        const uncachedUsersInfo = await this._loadUsersInfo(uncachedUsers);
        this._cachedUsers.push(...uncachedUsersInfo);
        return [...cachedUsers, ...uncachedUsersInfo].map((user) => ({
            type: "user",
            ...user
        }));
    }

    private async _loadGroupsInfo(group_ids: number[]): Promise<Omit<ICacheGroup, "type">[]> {
        const response: Omit<ICacheGroup, "type">[] = [];

        for (const chunk of utils.array.splitTo(group_ids, 500)) {
            const groups = await this.api.groups.getById({
                group_ids: chunk.map(Math.abs),
            });

            response.push(...groups.map((group) => ({
                id: group.id as number,
                name: group.name as string,
                photo: group.photo_100 as string
            })));
        }

        return response;
    }

    public async getGroupsInfo(group_ids: number[]): Promise<ICacheGroup[]> {
        group_ids = group_ids.map(Math.abs);
        const cachedGroups = this._cachedGroups.filter((user) => group_ids.includes(user.id));
        const uncachedGroups = group_ids.filter(id => cachedGroups.find(user => user.id === id) === undefined);

        const uncachedGroupsInfo = await this._loadGroupsInfo(uncachedGroups);
        this._cachedGroups.push(...uncachedGroupsInfo);
        return [...cachedGroups, ...uncachedGroupsInfo].map((group) => ({
            type: "group",
            ...group
        }));
    }

    public async getMembersInfo(peer_ids: number[]): Promise<(ICacheUser | ICacheGroup)[]> {
        const userIds = peer_ids.filter((peer_id) => peer_id > 0);
        const groupIds = peer_ids.filter((peer_id) => peer_id < 0);

        const users = await this.getUsersInfo(userIds);
        const groups = await this.getGroupsInfo(groupIds);

        return [...users, ...groups];
    }

    public resetCache(): void {
        this._cachedGroups = [];
        this._cachedUsers = [];
    }
}

export { signBox };
export type {
    TSign, ICacheUser, ICacheGroup
};

export default new Miniapp();
