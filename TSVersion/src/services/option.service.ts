import { OptionModel } from "../models";
import { Option } from "../types/Option.types";

export async function getQuestionOptions(idQuestion: number): Promise<Option[]> {
    const options = await OptionModel.findAll({
        where: { id_question: idQuestion }
    });
    return options;
}
