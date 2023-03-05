import { Request, Response } from "express";
import passport from "passport";
import { signToken } from "../../utils";
import { ApiError } from "../../middlewares/handleErrors";
import { BlindnessAcuityModel, StudentModel } from "../../models";
import { UserResp } from "../../types/responses/students.types";

// login with passport
export async function login(req: Request, res: Response, next: Function) {
    passport.authenticate("login-student", async (err, { id }, _info) => {
        try {
            if (err) {
                return next(new ApiError(err, 500));
            } else if (!id) {
                return next(new ApiError("Wrong credentials", 401));
            }
            req.login(id, { session: false }, async (err) => {
                if (err) return next(err);
                const token = signToken({ id });
                res.status(200).json({ token });
            });
        } catch (err) {
            console.error(err);
            return next(err);
        }
    })(req, res, next);
}

export async function whoami(
    req: Request,
    res: Response<UserResp>,
    next: Function
) {
    const { id } = req.user!;

    try {
        const student = await StudentModel.findByPk(id, {
            attributes: [
                "id_student",
                "first_name",
                "last_name",
                "username",
            ],
            include: [
                {
                    model: BlindnessAcuityModel,
                    attributes: ["id_blindness_acuity", "name"]
                },
            ],
        });

        if (!student) {
            return next(new ApiError("Student not found", 404));
        }
        // console.log(student)
        res.status(200).json({
            id: student.id_student,
            firstName: student.first_name,
            lastName: student.last_name,
            username: student.username,
            visualCondition: student.BlindnessAcuityModel?.name || "non-visually impaired",
        });
    } catch (err:any) {
        throw new ApiError(err.message, 500);
    }
}
