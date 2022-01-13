import fastify from "fastify";

import httpsRedirect from "fastify-https-redirect";
import fastifyFormBody from "fastify-formbody";
import fastifyMultiPart from "fastify-multipart";
import fastifyCors from "fastify-cors";
import fastifyHelmet from "fastify-helmet";
import fastifyHttpProxy from "fastify-http-proxy";

import DB from "../DB";

const server = fastify({
	https: {
		key: DB.config.server.key,
		cert: DB.config.server.cert,
	},
});

server.register(httpsRedirect);
server.register(fastifyFormBody);
server.register(fastifyMultiPart);
server.register(fastifyCors, { origin: "*" });
server.register(fastifyHelmet);
server.register(fastifyHttpProxy, {
	upstream: "https://mpt.ru",
	prefix: "/mpt",
});

server.get("/ping", (_req, reply) => {
	reply.send("pong");
});

export default server;
