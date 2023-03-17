import { QueryTypes } from "sequelize";
import sequelize from "../database/db";
import { ApiError } from "../middlewares/handleErrors";
import { LinkModel, TaskModel } from "../models";
import { Link } from "../types/Link.types";

export async function getLinkByOrder(
  taskOrder: number,
  linkOrder: number
): Promise<Link> {
  const links = (await sequelize.query(
    `
        SELECT l.* FROM link l
        JOIN task t ON l.id_task = t.id_task
        WHERE t.task_order = ${taskOrder} AND l.link_order = ${linkOrder}
        LIMIT 1;
    `,
    { type: QueryTypes.SELECT }
  )) as Link[];
  if (!links.length) throw new ApiError("Link not found", 404);
  return links[0];
}

export async function getTaskLinksCount(idTask: number): Promise<number> {
  return await LinkModel.count({ where: { id_task: idTask } });
}
