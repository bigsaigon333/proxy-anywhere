import micromatch from "micromatch";

export type ProxyRule = {
  path: string;
  target: string;
  rewritePath?: Record<string, string>;
  queryString?: Record<string, string>;
};

export const proxyRuleMap = new Map<string, ProxyRule>([
  [
    "https://bigsaigon333.me",
    {
      path: "/naver",
      target: "https://sports.news.naver.com",
      rewritePath: {
        "^/naver": "",
      },
    },
  ],
]);

export function getProxyRule(key: string, path: string): ProxyRule | null {
  const proxyRule = proxyRuleMap.get(key);

  if (proxyRule == null) return null;

  if (!micromatch.isMatch(path, proxyRule.path)) return null;

  return proxyRule;
}

/*
{
  [referer]: {
    target: string;
    rewritePath?: Record<string, string>;
    queryString?: Record<string, string>;
  }[]
}
*/
