import fastify from "fastify";

import rateLimit from "fastify-rate-limit";
import httpsRedirect from "fastify-https-redirect";
import formBody from "fastify-formbody";
import multiPart from "fastify-multipart";
import cors from "fastify-cors";
import helmet from "fastify-helmet";
import httpProxy from "fastify-http-proxy";

import DB from "../DB";
import APIError from "./Error";

const server = fastify({
	https: {
		key: DB.config.server.key,
		cert: DB.config.server.cert,
	},
});

server.register(rateLimit, {
	max: 25,
	ban: 3,
});
server.register(httpsRedirect);
server.register(formBody);
server.register(multiPart);
server.register(cors, { origin: "*" });
server.register(helmet);
server.register(httpProxy, {
	upstream: "https://mpt.ru",
	prefix: "/mpt",
});

server.get("/ping", (_req, reply) => {
	reply.send("pong");
});

server.setNotFoundHandler(() => {
	throw new APIError(1);
});

server.setErrorHandler((err, req, reply) => {
	if (err instanceof APIError) {
		reply.status(200).send({ error: err.toJSON() });
	} else {
		if (reply.statusCode === 429) {
			reply.status(200).send({ error: new APIError(4).toJSON() });
		} else {
			reply.status(200).send({ error: new APIError(0).toJSON() });
		}
	}
});

export default server;
