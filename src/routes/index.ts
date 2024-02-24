import { Type } from "@sinclair/typebox";
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
    url: "/*",
    schema: {
      headers: Type.Object({
        referer: Type.String(),
      }),
    },
    preValidation(request, _, done) {
      const { referer } = request.headers;
      const urlPattern = /^https?:\/\//;

      if (referer == null || !urlPattern.test(referer)) {
        throw Error(`Invalid referer: ${referer}`);
      }

      done();
    },
    async handler(request, reply) {
      const { url } = request;
      const { referer } = request.headers;

      const upstreamOrigin = getProxyUpstream(referer);
      const path = url.replace(new RegExp("^" + fastify.prefix), "");

      const upstreamUrl = upstreamOrigin + path;
      reply.from(upstreamUrl, {
        rewriteRequestHeaders(_, headers) {
          request.log.info({ headers }, "upstream request header");

          return headers;
        },
      });

      return reply;
    },
  });
}

function getProxyUpstream(key: string) {
  return "https://sports.news.naver.com";
}
