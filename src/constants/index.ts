type SyntaxListType = {
  syntax: string;
  paramsNumber: number;
};
export const SYNTAX_LIST: SyntaxListType[] = [
  {
    syntax: '/offer',
    paramsNumber: 2,
  },
  {
    syntax: '/cancel',
    paramsNumber: 0,
  },
  {
    syntax: '/reopen',
    paramsNumber: 0,
  },
];
