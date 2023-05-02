import { Request, Response, NextFunction } from "express";
import { UserDto } from "@dto/student/auth.dto";
import { LoginDto } from "@dto/global/auth.dto";
import { loginStudent } from "@services/auth.service";
import { whoami as whoamiService } from "@services/student.service";

// login with passport
export async function login(
  req: Request,
  res: Response<LoginDto>,
  next: NextFunction
) {
  try {
    res.status(200).json(await loginStudent(req, res, next));
  } catch (err) {
    next(err);
  }
}

export async function whoami(
  req: Request,
  res: Response<UserDto>,
  next: NextFunction
) {
  const { id } = req.user!;
  try {
    res.status(200).json(await whoamiService(id));
  } catch (err) {
    next(err);
  }
}
