import { Model, ForeignKey } from "sequelize";
import { Power } from "./enums";

export interface TaskAttempt {
  id_task_attempt: number;
  id_task: ForeignKey<number>;
  id_team?: ForeignKey<number> | null;
  id_student: ForeignKey<number>;
  power?: Power | null;
  active: boolean;
  time_stamp: Date;
}

export type TaskAttemptCreation = Omit<
  TaskAttempt,
  "id_task_attempt" | "time_stamp" | "active"
>;
