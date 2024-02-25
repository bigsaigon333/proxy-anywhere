import micromatch from "micromatch";

export type ProxyRule = {
  path: string;
  target: string;
  rewritePath?: Record<string, string>;
  queryString?: Record<string, string | number>;
};

export const proxyRuleMap = new Map<string, ProxyRule[]>([
  [
    "https://bigsaigon333.me",
    [
      {
        path: "/naver",
        target: "https://sports.news.naver.com",
        rewritePath: {
          "^/naver": "",
        },
        queryString: {
          abcd: "efg",
          "1234": 5678,
        },
      },
    ],
  ],
]);

export function getProxyRule(key: string, path: string): ProxyRule | null {
  const proxyRuleList = proxyRuleMap.get(key) ?? [];

  const proxyRule = proxyRuleList.find((rule) =>
    micromatch.isMatch(path, rule.path),
  );

  if (proxyRule == null) return null;

  return proxyRule;
}
