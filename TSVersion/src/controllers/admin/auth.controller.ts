import { Request, Response, NextFunction } from "express";
import { LoginDto } from "@dto/global/auth.dto";
import { loginAdmin } from "@services/auth.service";

// login with passport
export async function login(
  req: Request,
  res: Response<LoginDto>,
  next: NextFunction
) {
  try {
    res.status(200).json(await loginAdmin(req, res, next));
  } catch (err) {
    next(err);
  }
}
