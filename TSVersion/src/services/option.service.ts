import { ApiError } from "@middlewares/handleErrors";
import { OptionModel } from "@models";
import { Option } from "@interfaces/Option.types";

export async function getQuestionOptions(
  idQuestion: number
): Promise<Option[]> {
  const options = await OptionModel.findAll({
    where: { id_question: idQuestion }
  });
  return options;
}
