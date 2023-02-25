import { Request, Response } from 'express';
import { assignPowerToStudent, getBlindnessAcFromStudent, getStudentById, getTeamFromStudent, getTeammates } from '../../services/student.service';
import { addStudentToTeam, getMembersFromTeam, getTeamByCode, removeStudFromTeam } from '../../services/team.service';
import { ApiError } from '../../middlewares/handleErrors';
import { LoginTeamReq } from '../../types/requests/students.types';
import { getTeamsFromCourse } from '../../services/course.service';
import { StudentSocket, TeamResp } from '../../types/responses/students.types';
import { getStudCurrTaskAttempt } from '../../services/taskAttempt.service';
import { Power } from '../../types/enums';
import { PowerReq } from "../../types/requests/students.types";
import { Namespace, of } from '../../listeners/sockets';
import { Student, TeamMember } from '../../types/Student.types';
import { Team } from '../../types/Team.types';

export async function getTeams(req: Request, res: Response<TeamResp[]>, next: Function) {
    try {
        const { id: idUser } = req.user!;
        const { id_course } = await getStudentById(idUser);
        const teams = await getTeamsFromCourse(id_course);
        res.status(200).json([]);
        // res.status(200).json(teams.filter(t => t.active).map(({ name, code, id_team: id }) => ({
        //     id,
        //     name,
        //     code: code || '',
        // })));
    } catch (err) {
        next(err);
    }
}

export async function joinTeam(req: Request<LoginTeamReq>, res: Response, next: Function) {
    const { id: idStudent } = req.user!;
    const { code, taskOrder } = req.body as LoginTeamReq;

    if (!code || !taskOrder) return next(new ApiError('Missing code or taskOrder', 400));
    let prevTeam;
    try {
        prevTeam = await getTeamFromStudent(idStudent); // check if student is already in a team
    } catch (err) { } // no team found for student (expected)

    try {
        const team = await getTeamByCode(code);
        if (team.id_team === prevTeam?.id_team) throw new ApiError('Student is already in this team', 400);

        const student = await getStudentById(idStudent);
        if (student.id_course !== team.id_course) throw new ApiError('Student and team are not in the same course', 400);
        if (!team.active) throw new ApiError('Team is not active', 400);

        const teammates = await getMembersFromTeam({ idTeam: team.id_team });
        if (teammates.length >= 3) throw new ApiError('Team is full', 400);

        await addStudentToTeam(idStudent, team.id_team, taskOrder);
        res.status(200).json({ message: 'Done' });

        // sockets
        try { // if an error occurs, then it will not be sent to the next() function and the server will not crash
            const nsp = of(Namespace.STUDENTS);
            const summMembers = (teammates: TeamMember[]): StudentSocket[] => ( // summarize members data to send to client
                teammates.map(({ id_student, first_name, last_name, username, task_attempt: { power } }) => ({
                    id: id_student,
                    firstName: first_name,
                    lastName: last_name,
                    username,
                    power,
                }))
            );
            
            let power: Power | null;
            getBlindnessAcFromStudent(idStudent).then(async ({ level }) => {
                try {
                    power = await assignPowerToStudent(idStudent, 'auto', teammates, level, false); // only allow conflicts if student requests for a power, which is not the case here
                } catch (err) {
                    power = null;
                }
            }).catch(err => console.log(err)).finally(() => {
                if (!nsp) return;
                const { first_name, last_name, username } = student;
                const data: StudentSocket[] = [
                    ...summMembers(teammates),
                    {
                        id: idStudent,
                        firstName: first_name,
                        lastName: last_name,
                        username: username,
                        power,
                    }
                ];
                nsp.to('t' + team.id_team).emit('session:student:joined', data);
            });
    
            if (prevTeam) { // notify previous team that student left
                if (!nsp) return;
                const idPrevTeam = prevTeam.id_team;
                getMembersFromTeam({ idTeam: idPrevTeam }).then(async (prevTeamMembers) => {
                    const data: StudentSocket[] = summMembers(prevTeamMembers);
                    nsp.to('t' + idPrevTeam).emit('session:student:left', data);
                }).catch(err => console.log(err));
            }
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        next(err);
    }
}

export async function leaveTeam(req: Request, res: Response, next: Function) {
    const { id: idStudent } = req.user!;

    let idTeam;
    try {
        idTeam = (await getTeamFromStudent(idStudent)).id_team; // check if student is already in a team
    } catch (err) { }

    try {
        await removeStudFromTeam(idStudent);
        res.status(200).json({ message: 'Done' });
    } catch (err) {
        next(err);
    }

    if (!idTeam) return;
    try {
        // check if this student had super_hearing to assign it to another student
        const { power } = await getStudCurrTaskAttempt(idStudent);
        if (power !== Power.SuperHearing) return; // student doesn't have super_hearing

        const teammates = await getTeammates(idStudent);
        if (!teammates.length) return; // no teammates left

        const blindnessLevels = teammates.map(({ blindness_acuity: { level } }) => level);
        const maxBlindnessLevel = Math.max(...blindnessLevels);
        if (maxBlindnessLevel === 0) return; // no teammates with blindness

        const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
        const { id_student: idNewStudent } = teammates[withMaxBlindnessIdx];
        assignPowerToStudent(idNewStudent, Power.SuperHearing, teammates);
    } catch (err) {
        console.log(err);
    }
}

export async function reqPower(req: Request, res: Response, next: Function) {
    const { power } = req.body as PowerReq;
    const { id: idStudent } = req.user!;
    try {
        const teammates = await getTeammates(idStudent);
        await assignPowerToStudent(idStudent, power, teammates);
        res.status(200).json({ message: 'Power assigned successfully' });
    } catch (err) {
        next(err);
    }
}

export async function ready(req: Request, res: Response, next: Function) {
    const { id: idStudent } = req.user!;
    try {
        const { power } = await getStudCurrTaskAttempt(idStudent);
        if (!power) return res.status(400).json({ message: 'You don\'t have any power' });
        res.status(200).json({ message: 'Ok' });
    } catch (err) {
        next(err);
    }
}
