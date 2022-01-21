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
		if (err.validation.some((x) => x.keyword === "required")) {
			reply.status(200).send({
				error: new APIError({
					code: 5,
					request,
					additional: {
						required_params: err.validation
							.filter((x) => x.keyword === "required")
							.map((x) => x.params.missingProperty),
					},
				}).toJSON(),
			});
		} else {
			const error = new APIError({ code: 0, request });
			reply.status(200).send({ error: error.toJSON() });
		}
	}

	if (err instanceof APIError) {
		reply.status(200).send({ error: err.toJSON() });
	} else {
		if (reply.statusCode === 429) {
			const error = new APIError({ code: 4, request });
			reply.status(200).send({ error: error.toJSON() });
		} else {
			const error = new APIError({ code: 0, request });
			reply.status(200).send({ error: error.toJSON() });
		}
	}
});

export default server;
