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

export async function getOptionById(idOption: number): Promise<Option> {
  const option = await OptionModel.findOne({
    where: { id_option: idOption }
  });
  if (!option) throw new ApiError("Option not found", 404);
  return option;
}
