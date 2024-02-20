import { Type } from "@sinclair/typebox";
import { ServerResponse } from "http";
import ky from "ky";
import { TypedFastifyInstance } from "~/types/fastify.js";

if (process.env.NODE_ENV === "development") {
  /**
   * fetch failed: unable to get local issuer certificate", 를 해소하기 위해 추가
   */
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function RoutePlugin(fastify: TypedFastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      headers: Type.Object({ to: Type.String() }),
    },
    preValidation(request, reply, done) {
      const { to } = request.headers;
      const urlPattern = /^https?:\/\//;

      if (!urlPattern.test(to)) {
        throw Error(`Invalid url: ${to}`);
      }

      done();
    },
    async handler(request, reply) {
      const { to } = request.headers;

      /**
       * TODO: 다른 header 옵션, queryParam, 등등 모두 이전하기
       * 참고: https://github.com/fastify/fastify-http-proxy/blob/master/index.js#L225
       * https://github.com/fastify/fastify-reply-from/blob/master/index.js
       */

      reply.from(to);

      return reply;
    },
  });
}
