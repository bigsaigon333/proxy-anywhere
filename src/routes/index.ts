import { Type } from "@sinclair/typebox";
import { getProxyRule } from "~/services/proxyRule.js";
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
    url: "*",
    schema: {
      headers: Type.Object({
        referer: Type.String({ pattern: "^https?://" }),
      }),
    },
    async handler(request, reply) {
      const { url } = request;
      const { referer } = request.headers;
      const { origin: refererOrigin } = new URL(referer);

      const proxyRule = getProxyRule(refererOrigin);
      if (proxyRule == null) {
        return reply
          .status(404)
          .send({ reason: `No proxy rule found: ${refererOrigin}` });
      }

      const { target: upstreamOrigin, rewritePath = {} } = proxyRule;
      let path = url.replace(new RegExp(`^${fastify.prefix}`), "");

      for (const [key, value] of Object.entries(rewritePath)) {
        const regex = new RegExp(key);

        if (regex.test(path)) {
          path = path.replace(regex, value);
          break;
        }
      }

      const upstreamUrl = upstreamOrigin + path;
      reply.from(upstreamUrl, {
        rewriteRequestHeaders: (_, headers) => {
          this.log.info({ headers }, "upstream request header");

          return headers;
        },
      });

      return reply;
    },
  });
}
