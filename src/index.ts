import mongoose from 'mongoose';

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
      if (!data) throw new Error('No data in create operation');
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
      if (!id) throw new Error('No id in update operation');
      const oldObj = await model.findById(id);
      if (!oldObj) throw new Error('Invalid id');
      const newObj = Object.assign(oldObj, data);
      const res = await newObj.save();
      return res ? res.toObject() : res;
    },
    delete: async ({ id }: { id: string }) => {
      if (!id) throw new Error('No id in delete operation');
      const res = await model.findById(id);
      if (!res) throw new Error('Invalid id');
      await res.remove();
      return res ? res.toObject() : res;
    },
  };
}
