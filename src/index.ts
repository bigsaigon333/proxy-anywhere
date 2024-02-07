import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import Fastify from "fastify";
import { Type } from "@sinclair/typebox";

const fastify = Fastify({
  logger: true,
}).withTypeProvider<TypeBoxTypeProvider>();

fastify.get(
  "/",
  {
    schema: {
      querystring: Type.Object({
        to: Type.String(),
      }),
    },
  },
  async function handler(request, reply) {
    const { to } = request.query;

    return { to };
  }
);

try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
