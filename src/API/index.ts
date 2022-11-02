import fs from "node:fs";
import DB from "../lib/DB";
import Fastify from "fastify";
import {
    TypeBoxTypeProvider,
    TypeBoxValidatorCompiler,
} from "@fastify/type-provider-typebox";

import APIError from "./APIError";

import rateLimit from "@fastify/rate-limit";
import formBody from "@fastify/formbody";
import multiPart from "@fastify/multipart";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import httpProxy from "@fastify/http-proxy";
import miniapp from "../lib/miniapp";

const server = Fastify({
    https: DB.config.server.cert && DB.config.server.key ? {
        key: fs.readFileSync(DB.config.server.key),
        cert: fs.readFileSync(DB.config.server.cert),
    } : null,
}).withTypeProvider<TypeBoxTypeProvider>();
server.setValidatorCompiler(TypeBoxValidatorCompiler);

void server.register(rateLimit, {
    max: 25,
    ban: 3,
});
void server.register(formBody);
void server.register(multiPart);
void server.register(cors, { origin: "*" });
void server.register(helmet);
void server.register(httpProxy, {
    upstream: "https://mpt.ru",
    prefix: "/mpt"
});

server.setReplySerializer((payload) => {
    if (Object.prototype.hasOwnProperty.call(payload, "error")) {
        return JSON.stringify(payload);
    } else {
        return JSON.stringify({ response: payload });
    }
});

server.setNotFoundHandler((request) => {
    throw new APIError({ code: 1, request });
});

server.addHook<{Headers?: {sign?: string}}>("preValidation", (request, reply, done) => {
    const url = request.url.substring(1);
    const [section, method] = url.split(".");

    if (!section || !method) {
        throw new APIError({
            code: 1, request
        });
    }

    if (section === "app") {
        const rawSign = request.headers.sign;

        if (typeof rawSign !== "string" || !miniapp.isValidSign(rawSign)) {
            throw new APIError({
                code: 7, request
            });
        }

        const sign = miniapp.parseSign(rawSign, true);

        if (Math.floor(Date.now() / 1000) - 15 * 60 > sign.vk_ts) {
            throw new APIError({
                code: 7, request,
            });
        }

        request.body = {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            ...request.body, sign
        };
    }

    done();
});

server.setErrorHandler((err, request, reply) => {
    if (err.validation) {
        return reply.status(200).send({
            error: new APIError({
                code: 5,
                request,
            }).toJSON(),
        });
    }

    if (err instanceof APIError) {
        return reply.status(200).send({ error: err.toJSON() as never });
    } else {
        if (reply.statusCode === 429) {
            const error = new APIError({ code: 4, request });
            return reply.status(200).send({ error: error.toJSON() });
        } else {
            const error = new APIError({ code: 0, request });
            return reply.status(200).send({ error: error.toJSON() });
        }
    }
});

export default server;
