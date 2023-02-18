import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { TeamModel } from "../models";
import { Team } from "../types/database/Team.types";
import { ApiError } from "../middlewares/handleErrors";

export async function getTeamByCode(code: string): Promise<Team> {
    const team = await TeamModel.findOne({ where: { code } });
    if (!team) throw new ApiError('Team not found', 404);
    return team;
}

export async function getTeamFromStudent(idStudent: number): Promise<Team> {
    const team = await sequelize.query(`
        SELECT t.* FROM team t
        JOIN task_attempt ta ON ta.id_team = t.id_team
        WHERE ta.id_student = ${idStudent} AND ta.active = TRUE AND t.active = TRUE
        LIMIT 1;
    `, { type: QueryTypes.SELECT }) as Team[];
    if (!team.length) throw new ApiError("Team not found", 400);
    return team[0];
}
