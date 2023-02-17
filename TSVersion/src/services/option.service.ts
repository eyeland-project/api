import { OptionModel } from "../models";
import { Option } from "../types/database/Option.types";

export async function getQuestionOptions(idQuestion: number): Promise<Option[]> {
    const options = await OptionModel.findAll({
        // attributes: ['id_option', 'content', 'correct', 'feedback'],
        where: { id_question: idQuestion }
    });
    return options;
}
