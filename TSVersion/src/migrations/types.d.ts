import { OptionCreation } from "@interfaces/Option.types";
import { QuestionCreation } from "@interfaces/Question.types";
export type QuestionMigration = Omit<
  QuestionCreation,
  | "type"
  | "topic"
  | "id_task_stage"
  | "question_order"
  | "image_url"
  | "image_alt"
  | "audio_url"
  | "video_url"
> & {
  type: string;
  topic: string;
  options?: OptionMigration[];
  imgAlt?: string;
  imgUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
};

export type OptionMigration = Omit<OptionCreation, "id_question">;

export type dataMigration = {
  order?: number;
  pretask: QuestionMigration[];
  durintask: QuestionMigration[];
  postask: QuestionMigration[];
}[];
