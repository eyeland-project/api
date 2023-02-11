declare global {
    namespace Express {
        interface Request {
            user: ReqUser;
        }
    }
}

interface ReqUser extends ReqUser {
    id: number;
    iat: number;
}
