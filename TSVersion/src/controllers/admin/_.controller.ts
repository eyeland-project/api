import { Request, Response, NextFunction } from "express";
import { ApiError } from "@middlewares/handleErrors";
import * as repositoryService from "@services/repository.service";
import { Model, ModelStatic } from "sequelize";

export default function <
  T extends {},
  K extends Partial<T>,
  M extends Model<T, K>
>(model: ModelStatic<M>) {
  // export default function <T, K, M extends Model>(
  //   model: ModelStatic<M>
  // ) {
  return {
    getElements: async function (
      _: Request,
      res: Response<T[]>,
      next: NextFunction
    ) {
      try {
        res
          .status(200)
          .json(<T[]>(<unknown>await repositoryService.findAll<M>(model)));
      } catch (err) {
        next(err);
      }
    },
    getElement: async function (
      req: Request<{ id: string }>,
      res: Response<T>,
      next: NextFunction
    ) {
      const id = parseInt(req.params.id);
      try {
        if (isNaN(id) || id <= 0) {
          throw new ApiError("Invalid id", 400);
        }
        res.status(200).json(
          <T>(<unknown>await repositoryService.findOne<M>(model, {
            where: { [model.primaryKeyAttribute as any]: id as any }
            // where: { [model.primaryKeyAttribute]: id } as WhereOptions
          }))
        );
      } catch (err) {
        next(err);
      }
    },
    createElement: async function (
      req: Request<any, any, K>,
      res: Response<{ id: number }>,
      next: NextFunction
    ) {
      try {
        const element = await repositoryService.create<M>(
          model,
          req.body as any
        );
        res.status(201).json({
          id: element[model.primaryKeyAttribute as keyof M] as number
        });
      } catch (err) {
        next(err);
      }
    },
    updateElement: async function (
      req: Request<{ id: string }, any, Partial<K>>,
      res: Response<{ message: string }>,
      next: NextFunction
    ) {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          throw new ApiError("Invalid id", 400);
        }
        if (!Object.keys(req.body).length) {
          throw new ApiError("No fields provided", 400);
        }
        await repositoryService.update<M>(model, req.body as any, {
          where: { [model.primaryKeyAttribute as any]: id as any }
          // where: { [model.primaryKeyAttribute]: id } as WhereOptions
        });
        res
          .status(200)
          .json({ message: `${model.tableName} updated successfully` });
      } catch (err) {
        next(err);
      }
    },
    deleteElement: async function (
      req: Request<{ id: string }>,
      res: Response<{ message: string }>,
      next: NextFunction
    ) {
      try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
          throw new ApiError("Invalid id", 400);
        }
        await repositoryService.destroy<M>(model, {
          where: { [model.primaryKeyAttribute as any]: id as any }
          // where: { [model.primaryKeyAttribute]: id } as WhereOptions
        });
        res
          .status(200)
          .json({ message: `${model.tableName} deleted successfully` });
      } catch (err) {
        next(err);
      }
    }
  };
}
