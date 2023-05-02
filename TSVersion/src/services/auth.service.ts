import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { signToken } from "@utils";
import { ApiError } from "@middlewares/handleErrors";
import { Role } from "@interfaces/enums/role.enum";
import { LoginDto } from "@dto/global/auth.dto";

export function loginStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<LoginDto> {
  return new Promise((resolve, reject) => {
    passport.authenticate("login-student", async (err, { id }, _info) => {
      try {
        if (err) {
          return reject(new ApiError(err.message, 500));
        } else if (id === undefined || id === null) {
          return reject(new ApiError("Wrong credentials", 401));
        }
        req.login(id, { session: false }, async (err) => {
          if (err) return reject(new ApiError(err.message, 500));
          const token = signToken({ id, role: Role.STUDENT });
          resolve({ token });
        });
      } catch (err) {
        console.error(err);
        return reject(new ApiError("Internal server error", 500));
      }
    })(req, res, next);
  });
}

export function loginTeacher(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<LoginDto> {
  return new Promise((resolve, reject) => {
    passport.authenticate("login-teacher", async (err, { id }, _info) => {
      try {
        if (err) {
          return reject(new ApiError(err.message, 500));
        } else if (id === undefined || id === null) {
          return reject(new ApiError("Wrong credentials", 401));
        }
        req.login(id, { session: false }, async (err) => {
          if (err) return reject(new ApiError(err.message, 500));
          const token = signToken({ id, role: Role.TEACHER });
          resolve({ token });
        });
      } catch (err) {
        console.error(err);
        return reject(new ApiError("Internal server error", 500));
      }
    })(req, res, next);
  });
}

export function loginAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<LoginDto> {
  return new Promise((resolve, reject) => {
    passport.authenticate("login-admin", async (err, { id }, _info) => {
      try {
        if (err) {
          return reject(new ApiError(err.message, 500));
        } else if (id === undefined || id === null) {
          return reject(new ApiError("Wrong credentials", 401));
        }
        req.login(id, { session: false }, async (err) => {
          if (err) return reject(new ApiError(err.message, 500));
          const token = signToken({ id, role: Role.ADMIN });
          resolve({ token });
        });
      } catch (err) {
        console.error(err);
        return reject(new ApiError("Internal server error", 500));
      }
    })(req, res, next);
  });
}
