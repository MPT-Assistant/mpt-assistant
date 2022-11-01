import { Static, Type } from "@sinclair/typebox";
import { API } from "vk-io";
import CryptoJS from "crypto-js";

import config from "../DB/config";

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

class Miniapp {
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
}

export { signBox };
export type { TSign };

export default new Miniapp();
