import { ApiError } from "@middlewares/handleErrors";
import {
  Model,
  ModelStatic,
  FindOptions,
  Optional,
  UpdateOptions,
  DestroyOptions,
  CreationAttributes
} from "sequelize";
import { NullishPropertiesOf } from "sequelize/types/utils";

// from sequelize
type MakeNullishOptional<T extends object> = T extends any
  ? Optional<T, NullishPropertiesOf<T>>
  : never;

// get all
export async function findAll<T extends Model>(
  model: ModelStatic<T>,
  options?: FindOptions<T>
): Promise<T[]> {
  return await model.findAll(options);
}

// get one
export async function findOne<T extends Model>(
  model: ModelStatic<T>,
  options?: FindOptions<T>
): Promise<T> {
  const element = await model.findOne(options);
  if (!element) throw new ApiError(`${model.tableName} not found`, 404);
  return element;
}

// create
export async function create<T extends Model>(
  model: ModelStatic<T>,
  values: CreationAttributes<T>
): Promise<T> {
  return model.create(values);
}

// update
export async function update<T extends Model>(
  model: ModelStatic<T>,
  values: Partial<MakeNullishOptional<T>>,
  options: UpdateOptions<T>
): Promise<[number]> {
  const [updatedRowsCount] = await model.update(values, options);
  if (!updatedRowsCount)
    throw new ApiError(`Couldn't update ${model.tableName}`, 400);
  return [updatedRowsCount];
}

// delete
export async function destroy<T extends Model>(
  model: ModelStatic<T>,
  options: DestroyOptions<T>
): Promise<number> {
  const deletedRowsCount = await model.destroy(options);
  if (!deletedRowsCount)
    throw new ApiError(`Couldn't delete ${model.tableName}`, 400);
  return deletedRowsCount;
}
