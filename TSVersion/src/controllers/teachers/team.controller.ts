import { Request, Response } from "express";
import { getTeamsFromCourseWithNumStud } from "../../services/course.service";
import {
    createTeam as createTeamServ,
    getTeamById,
    getStudentsFromTeam,
    updateTeam as updateTeamServ
} from "../../services/team.service";
import { TeamResp, TeamSummResp, ElementCreatedResp } from "../../types/responses/teachers.types";
import { TeamCreateReq, TeamUpdateReq } from "../../types/requests/teachers.types";
import { getTeacherById } from "../../services/teacher.service";
import { TeamMember } from "../../types/Student.types";

export async function getTeams(req: Request<{ idCourse: number }>, res: Response<TeamSummResp[]>, next: Function) {
    const { idCourse } = req.params;
    const { active } = req.query as { active?: boolean };

    try {
        res.status(200).json(await getTeamsFromCourseWithNumStud(idCourse, active === false ? false : true)); // get active teams by default
    } catch (err) {
        next(err);
    }
}

export async function getTeam(req: Request<{ idTeam: number }>, res: Response<TeamResp>, next: Function) {
    const { idTeam } = req.params;
    try {
        const team = await getTeamById(idTeam);
        const { id_team, name, active, code } = team;
        let students: TeamMember[];
        try {
            students = await getStudentsFromTeam({ idTeam: id_team });
        } catch (err) {
            console.log(err);
            students = [];
        }
        res.status(200).json({
            id: id_team,
            name,
            active,
            code: code || '',
            students: students.map(({ id_student, first_name, last_name, username, task_attempt: { power } }) => ({
                id: id_student,
                firstName: first_name,
                lastName: last_name,
                username,
                power
            }))
        });
    } catch (err) {
        next(err);
    }
}

export async function createTeam(req: Request<{ idCourse: number }>, res: Response<ElementCreatedResp>, next: Function) {
    const { idCourse } = req.params;
    const { name } = req.body as TeamCreateReq;
    
    try {
        const { id_team } = await createTeamServ(name, idCourse);
        res.status(201).json({ id: id_team });
    } catch (err) {
        next(err);
    }
}

export async function updateTeam(req: Request<{ idTeam: number }>, res: Response, next: Function) {
    const { idTeam } = req.params;
    const fields = req.body as Partial<TeamUpdateReq>;
    try {
        await updateTeamServ(idTeam, fields);
        res.status(200).json({ message: 'Team updated successfully' });
    } catch (err) {
        next(err);
    }
}
