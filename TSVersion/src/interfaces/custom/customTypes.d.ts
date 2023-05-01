/// <reference path="./array-extensions.ts" />
export {};
declare global {
  namespace Express {
    interface User extends ReqUser {}
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        stream: Readable;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
  interface ReqUser extends ReqUser {
    id: number;
  }
}
