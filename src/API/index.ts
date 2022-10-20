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
