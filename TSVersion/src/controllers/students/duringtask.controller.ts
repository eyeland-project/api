import { Request, Response } from "express";
import {
  getQuestionByOrder,
  getTaskStageQuestionsCount
} from "@services/question.service";
import { getQuestionOptions } from "@services/option.service";
import {
  getQuestionsFromTaskStage,
  getTaskStageByOrder
} from "@services/taskStage.service";
import { ApiError } from "@middlewares/handleErrors";
import { getStudCurrTaskAttempt } from "@services/taskAttempt.service";
import {
  separateTranslations,
  distributeOptions,
  shuffle,
  indexPower
} from "@utils";
import { getTeammates } from "@services/student.service";
import { AnswerOptionReq } from "@dto/student/answer.dto";
import { answerDuringtask } from "@services/answer.service";
import {
  DuringtaskQuestionResp,
  DuringtaskResp
} from "@dto/student/question.dto";

export async function root(
  req: Request<{ taskOrder: number }>,
  res: Response<DuringtaskResp>,
  next: Function
) {
  try {
    const { taskOrder } = req.params;
    const { description, keywords, id_task_stage } = await getTaskStageByOrder(
      taskOrder,
      2
    );
    res.status(200).json({
      description: description,
      keywords: keywords,
      numQuestions: await getTaskStageQuestionsCount(id_task_stage)
    });
  } catch (err) {
    next(err);
  }
}

export async function getQuestion(
  req: Request<{ taskOrder: number; questionOrder: number }>,
  res: Response<DuringtaskQuestionResp>,
  next: Function
) {
  const { id: idStudent } = req.user!;
  const { taskOrder, questionOrder } = req.params;
  try {
    const {
      id_question,
      content,
      type,
      topic,
      img_alt,
      img_url,
      audio_url,
      video_url
    } = await getQuestionByOrder(taskOrder, 2, questionOrder);
    let options = await getQuestionOptions(id_question);

    const {
      nouns,
      preps,
      content: contentParsed
    } = separateTranslations(content);
    const { id_team, power } = await getStudCurrTaskAttempt(idStudent);

    // * If student has no team, send error
    if (!id_team || !power) {
      throw new ApiError("No team or power found", 400);
    }
    const members = (await getTeammates(idStudent, { idTeam: id_team })).map(
      ({ task_attempt }) => task_attempt.power
    );
    members.push(power);
    members.sort((a, b) => indexPower(a) - indexPower(b));

    // * shuffle options
    options = shuffle(options, (id_team + 1) * (id_question + 2));
    // * distribute options based on power
    options = distributeOptions(
      options,
      members.indexOf(power) + 1,
      members.length
    );

    res.status(200).json({
      content: contentParsed,
      type,
      topic,
      id: id_question,
      imgAlt: img_alt || "",
      imgUrl: img_url || "",
      audioUrl: audio_url || "",
      videoUrl: video_url || "",
      nounTranslation: nouns,
      prepositionTranslation: preps,
      options: options.map(({ id_option, content, correct, feedback }) => ({
        id: id_option,
        content,
        correct,
        feedback: feedback || ""
      }))
    });
  } catch (err) {
    next(err);
  }
}

export async function getQuestions(
  req: Request<{ taskOrder: number }>,
  res: Response<DuringtaskQuestionResp[]>,
  next: Function
) {
  const { taskOrder } = req.params;
  try {
    const questionsWithOptions = (
      await getQuestionsFromTaskStage(taskOrder, 2)
    ).map(({ content, ...fields }) => {
      const {
        nouns,
        preps,
        content: contentParsed
      } = separateTranslations(content);
      return {
        ...fields,
        content: contentParsed,
        nounTranslation: nouns,
        prepositionTranslation: preps
      };
    });
    res.status(200).json(questionsWithOptions);
  } catch (err) {
    next(err);
  }
}

export async function answer(
  req: Request<
    { taskOrder: number; questionOrder: number },
    any,
    AnswerOptionReq
  >,
  res: Response,
  next: Function
) {
  const { id: idStudent } = req.user!;
  const { taskOrder: taskOrderStr, questionOrder: questionOrderStr } =
    req.params;
  const { idOption, answerSeconds } = req.body;

  const taskOrder = +taskOrderStr;
  const questionOrder = +questionOrderStr;

  if (isNaN(taskOrder) || taskOrder < 1)
    return res.status(400).json({ message: "Bad taskOrder" });
  if (isNaN(questionOrder) || questionOrder < 1)
    return res.status(400).json({ message: "Bad questionOrder" });
  if (!idOption || idOption < 1)
    return res.status(400).json({ message: "Bad idOption" });

  try {
    const { alreadyAnswered } = await answerDuringtask(
      idStudent,
      taskOrder,
      questionOrder,
      idOption,
      answerSeconds
    );
    if (!alreadyAnswered) return res.status(200).json({ message: "Answered" });
    res.status(202).json({ message: "Already answered" });
  } catch (err) {
    next(err);
  }
}
