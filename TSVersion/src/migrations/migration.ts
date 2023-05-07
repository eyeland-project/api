import { QuestionMigration, dataMigration } from "./types";
import { TaskModel, TaskStageModel, QuestionModel, OptionModel } from "@models";

export default async (data: dataMigration) => {
  let taskIndex = 0;
  for (const task of data) {
    taskIndex++;
    const taskCreated = await TaskModel.findOne({
      where: { task_order: task.order ?? taskIndex }
    });
    if (!taskCreated) {
      throw new Error(`Task with order ${task.order} not found`);
    }

    let taskStage = await TaskStageModel.findOne({
      where: { id_task: taskCreated.id_task, task_stage_order: 1 }
    });

    if (!taskStage) {
      throw new Error(`Task stage with order 1 not found`);
    }

    await createQuestions(taskStage.id_task_stage, task.pretask);

    taskStage = await TaskStageModel.findOne({
      where: { id_task: taskCreated.id_task, task_stage_order: 2 }
    });

    if (!taskStage) {
      throw new Error(`Task stage with order 2 not found`);
    }

    await createQuestions(taskStage.id_task_stage, task.durintask);

    taskStage = await TaskStageModel.findOne({
      where: { id_task: taskCreated.id_task, task_stage_order: 3 }
    });

    if (!taskStage) {
      throw new Error(`Task stage with order 3 not found`);
    }

    await createQuestions(taskStage.id_task_stage, task.postask);
  }
};

async function createQuestions(
  taskStageId: number,
  questions: QuestionMigration[]
) {
  let questionIndex = 0;

  for (const question of questions) {
    questionIndex++;
    const questionCreated = await QuestionModel.create({
      content: question.content,
      type: question.type,
      topic: question.topic,
      img_alt: question.imgAlt,
      img_url: question.imgUrl,
      id_task_stage: taskStageId,
      question_order: questionIndex
    });
    if (question.options) {
      for (const option of question.options) {
        await OptionModel.create({
          content: option.content,
          correct: option.correct,
          feedback: option.feedback,
          id_question: questionCreated.id_question
        });
      }
    }
  }
}
