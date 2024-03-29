import { Type } from "@sinclair/typebox";
import { URL } from "node:url";
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
      params: Type.Object({
        "*": Type.String(),
      }),
      querystring: Type.Record(
        Type.String(),
        Type.Union([Type.String(), Type.Number()]),
      ),
    },
    async handler(request, reply) {
      const {
        query: hostQueryString,
        params: { "*": hostPath },
        headers: { referer },
      } = request;

      const { origin: refererOrigin } = new URL(referer);
      const proxyRule = getProxyRule(refererOrigin, hostPath);
      if (proxyRule == null) {
        return reply.status(404).send({ reason: `No proxy rule found` });
      }

      const {
        target: upstreamOrigin,
        rewritePath: rewriteRules = {},
        queryString: upstreamQueryString = {},
      } = proxyRule;

      const upstreamPath = rewritePath(hostPath, rewriteRules);

      const upstreamUrl = appendSearchParams(
        new URL(upstreamOrigin + upstreamPath),
        hostQueryString,
        upstreamQueryString,
      );

      reply.from(upstreamUrl.href, {
        rewriteRequestHeaders: (_, headers) => {
          this.log.info({ headers }, "upstream request header");

          return headers;
        },
      });

      return reply;
    },
  });
}

function rewritePath(
  originalPath: string,
  rewriteRules: Record<string, string>,
) {
  for (const [key, value] of Object.entries(rewriteRules)) {
    const regex = new RegExp(key);

    if (regex.test(originalPath)) {
      return originalPath.replace(regex, value);
    }
  }
}

function appendSearchParams(
  url: URL,
  ...queries: Record<string, string | number>[]
) {
  const newUrl = new URL(url);

  for (const [key, value] of queries.flatMap(Object.entries)) {
    newUrl.searchParams.append(key, String(value));
  }

  return newUrl;
}
