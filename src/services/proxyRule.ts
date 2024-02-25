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
      path: "*",
      target: "https://sports.news.naver.com",
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
