/// <reference path="./array-extensions.ts" />
export {};
declare global {
  namespace Express {
    interface User extends ReqUser {}
  }
  interface ReqUser extends ReqUser {
    id: number;
  }
}
