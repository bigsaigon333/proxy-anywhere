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

export function getProxyRule(key: string): ProxyRule | undefined {
  return proxyRuleMap.get(key);
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
