import { Model, ForeignKey } from "sequelize";

export interface StudentTeam {
    id_student_team: number;
    power: 'super_hearing' | 'memory_pro' | 'super_radar';
    id_student: ForeignKey<number>;
    id_team: ForeignKey<number>;
};

export type StudentTeamCreation = Omit<StudentTeam, 'id_student_team'>;
