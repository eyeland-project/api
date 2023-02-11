import { Model, ForeignKey } from "sequelize";

export interface StudentTeam {
    id_student_team: number;
    id_student: ForeignKey<number>;
    id_team: ForeignKey<number>;
    power: 'super_hearing' | 'memory_pro' | 'super_radar';
};

export type StudentTeamCreation = Omit<StudentTeam, 'id_student_team'>;
