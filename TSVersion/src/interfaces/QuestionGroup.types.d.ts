import { ForeignKey } from "sequelize";

export interface QuestionGroup {
  id_question_group: number;
  id_team_name?: ForeignKey<number> | null;
}

export type QuestionGroupCreation = Omit<QuestionGroup, "id_question_group">;
