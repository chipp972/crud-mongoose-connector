import { customErrorFactory } from 'customizable-error';
import mongoose from 'mongoose';

const createMissingIdError = (operation: string, model: string) =>
  customErrorFactory({
    name: 'MissingId',
    code: 'MISSING_ID',
    status: 400,
    message: `Missing id for ${operation} ${model} operation`,
  });

const createMissingDataError = (operation: string, model: string) =>
  customErrorFactory({
    name: 'MissingData',
    code: 'MISSING_DATA',
    status: 400,
    message: `Missing data for ${operation} ${model} operation`,
  });

const createInvalidIdError = (operation: string, model: string, id: string) =>
  customErrorFactory({
    name: 'InvalidId',
    code: 'INVALID_ID',
    status: 400,
    message: `Invalid id ${id} for ${operation} ${model} operation`,
  });

export interface MongooseCrudModel<T> {
  create: (params: { data: any }) => Promise<T>;
  read: (params: { id?: string; data?: any }) => Promise<T | T[] | null>;
  update: (params: { id: string; data?: any }) => Promise<T | null>;
  delete: (params: { id: string }) => Promise<T | null>;
}

export function mongooseCrudConnector<T, U extends mongoose.Document>(
  model: mongoose.Model<U>,
): MongooseCrudModel<T> {
  return {
    create: async ({ data }: { data: any }) => {
      if (!data) throw createMissingDataError('create', model.modelName);
      const res = await model.create(data);
      return res.toObject();
    },
    read: async ({ id, data = {} }: { id?: string; data?: any }) => {
      const res = id ? await model.findById(id) : await model.find(data);
      return Array.isArray(res)
        ? res.map((obj) => obj.toObject())
        : res ? res.toObject() : res;
    },
    update: async ({ id, data }: { id: string; data?: any }) => {
      if (!id) throw createMissingIdError('update', model.modelName);
      const oldObj = await model.findById(id);
      if (!oldObj) throw createInvalidIdError('update', model.modelName, id);
      const newObj = Object.assign(oldObj, data);
      const res = await newObj.save();
      return res ? res.toObject() : res;
    },
    delete: async ({ id }: { id: string }) => {
      if (!id) throw createMissingIdError('delete', model.modelName);
      const res = await model.findById(id);
      if (!res) throw createInvalidIdError('delete', model.modelName, id);
      await res.remove();
      return res ? res.toObject() : res;
    },
  };
}
