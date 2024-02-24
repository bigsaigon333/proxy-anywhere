import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { RoutePlugin } from "~/routes/index.js";
import { envToLogger } from "./server.js";
import From from "@fastify/reply-from";

import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

export const startServer = async () => {
  const fastify = await Fastify({
    logger: envToLogger[process.env.NODE_ENV ?? "production"],
    ignoreTrailingSlash: true,
  }).withTypeProvider<TypeBoxTypeProvider>();

  await fastify.register(swagger);

  await fastify.register(swaggerUi, {
    routePrefix: "/swagger",
    uiConfig: {
      docExpansion: "full",
      deepLinking: false,
    },
    staticCSP: true,
  });

  fastify.register(cors, { origin: /localhost/ });

  fastify.register(From);

  try {
    fastify
      .register(RoutePlugin, { prefix: "api/proxy" })
      .listen({ port: Number(process.env.PORT) || 8080 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
