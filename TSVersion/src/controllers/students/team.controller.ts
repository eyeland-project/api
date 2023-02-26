import { Request, Response } from 'express';
import { assignPowerToStudent, getBlindnessAcFromStudent, getStudentById, getTeamFromStudent, getTeammates } from '../../services/student.service';
import { addStudentToTeam, getMembersFromTeam, getTeamByCode, removeStudFromTeam } from '../../services/team.service';
import { ApiError } from '../../middlewares/handleErrors';
import { LoginTeamReq } from '../../types/requests/students.types';
<<<<<<< HEAD
import { getTeamsFromCourse, getTeamsFromCourseWithStud } from '../../services/course.service';
import { StudentSocket, TeamResp, TeamSocket } from '../../types/responses/students.types';
=======
import { getTeamsFromCourse } from '../../services/course.service';
import { StudentSocket, TeamResp } from '../../types/responses/students.types';
>>>>>>> 669d1a0d35e017492267df76e3bac752b24822f9
import { getStudCurrTaskAttempt } from '../../services/taskAttempt.service';
import { Power } from '../../types/enums';
import { PowerReq } from "../../types/requests/students.types";
import { Namespace, of } from '../../listeners/sockets';
<<<<<<< HEAD
import { TeamMember } from '../../types/Student.types';
import { directory } from '../../listeners/namespaces/students';
=======
import { Student, TeamMember } from '../../types/Student.types';
import { Team } from '../../types/Team.types';
>>>>>>> 669d1a0d35e017492267df76e3bac752b24822f9

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

    const studSocket = directory.get(idStudent);
    if (!studSocket) return res.status(400).json({ message: 'Student is not connected' });

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

        // assign power + sockets (this could go to a subroutine)
        try { // if an error occurs, then it will not be sent to the next() function and the server will not crash
            studSocket.join('t' + team.id_team); // join student to team socket room

            getBlindnessAcFromStudent(idStudent).then(async ({ level }) => {
                let power: Power | null;
                try {
                    power = await assignPowerToStudent(idStudent, 'auto', teammates, level, false);
                } catch (err) {
                    console.log(err);
                    power = null;
                }

                let teamsData: TeamSocket[] | undefined; // for the course
                let teamData: StudentSocket[] | undefined; // for the team the student joined

                try {
                    teamsData = (await getTeamsFromCourseWithStud(team.id_course, true))
                        .map(({ id, students }) => ({ id, students }));
                } catch (err) {
                    console.log(err);
                }

                if (teamsData) {
                    studSocket.broadcast.to('c' + team.id_course).except('t' + team.id_team).emit('teams:student:joinedTeam', teamsData);
                    teamData = teamsData.find(t => t.id === team.id_team)?.students;
                }
                if (!teamData) {
                    teamData = [
                        ...summMembers(teammates),
                        {
                            id: idStudent,
                            firstName: student.first_name,
                            lastName: student.last_name,
                            username: student.username,
                            power,
                        }
                    ];
                }
                studSocket.broadcast.to('t' + team.id_team).emit('team:student:joined', teamData);
            }).catch(err => console.log(err));

            if (prevTeam) { // notify previous team that student left
                const nsp = of(Namespace.STUDENTS);
                if (!nsp) return;

                const idPrevTeam = prevTeam.id_team;
                getMembersFromTeam({ idTeam: idPrevTeam }).then(async (prevTeamMembers) => {
                    const teamData: StudentSocket[] = summMembers(prevTeamMembers);
                    nsp.to('t' + idPrevTeam).emit('team:student:left', teamData);
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

    const studSocket = directory.get(idStudent);
    if (!studSocket) return res.status(400).json({ message: 'Student is not connected' });

    try {
        const power = (await getStudCurrTaskAttempt(idStudent)).power;
        const { id_team } = await getTeamFromStudent(idStudent); // check if student is already in a team
        await removeStudFromTeam(idStudent);
        res.status(200).json({ message: 'Done' });

        try {
            studSocket.leave('t' + id_team); // leave student from team socket room
            // check if this student had super_hearing to assign it to another student
            if (power === Power.SuperHearing) {
                getTeammates(idStudent).then(async (teammates) => {
                    if (!teammates.length) return; // no teammates left

                    const blindnessLevels = teammates.map(({ blindness_acuity: { level } }) => level);
                    const maxBlindnessLevel = Math.max(...blindnessLevels);
                    if (maxBlindnessLevel === 0) return; // no teammates with blindness

                    const withMaxBlindnessIdx = blindnessLevels.indexOf(maxBlindnessLevel);
                    const { id_student: idNewStudent } = teammates[withMaxBlindnessIdx];
                    const power = await assignPowerToStudent(idNewStudent, Power.SuperHearing, teammates);
                    // TODO: notify that student got super_hearing
                }).catch(err => console.log(err));
            }

            const nsp = of(Namespace.STUDENTS);
            if (!nsp) return;
            getMembersFromTeam({ idTeam: id_team }).then(async (teamMembers) => {
                const teamData: StudentSocket[] = summMembers(teamMembers);
                nsp.to('t' + id_team).emit('team:student:left', teamData);
            }).catch(err => console.log(err));
        } catch (err) {
            console.log(err);
        }
    } catch (err) {
        next(err);
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

// this should be in a separate file
const summMembers = (teammates: TeamMember[]): StudentSocket[] => ( // summarize members data to send to client
    teammates.map(({ id_student, first_name, last_name, username, task_attempt: { power } }) => ({
        id: id_student,
        firstName: first_name,
        lastName: last_name,
        username,
        power,
    }))
);
