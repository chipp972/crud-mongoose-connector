# Crud Mongoose Connector

## Description

Create an object with CRUD operations from a mongoose model.

## Installation

```bash
npm i --save crud-mongoose-connector
```

## Usage

```javascript
import mongoose from 'mongoose';
import { mongooseCrudConnector, MongooseCrudModel } from 'crud-mongoose-connector';

interface TestModel {
  _id: string;
  name: string;
  anotherField?: Date;
}

const testSchema = new mongoose.Schema({
  anotherField: Date,
  name: { type: String, required: true },
});
const testModel = mongoose.model(testSchema, 'test');

const testCRUD: MongooseCrudModel<TestModel> = mongooseCrudConnector(testModel);

// then you can use testCRUD to create / read / update / delete
testCRUD.create({ data: { name: 'obj1', anotherField: new Date() }}); // returns a Promise with the newly created object
testCRUD.read({ id: 'example-uuid' }); // returns a Promise with ONE object or throws an error if no object found
testCRUD.read({ data: { name: 'obj1' } }); // returns a Promise with an array of all found object corresponding to the query
testCRUD.read({ id: 'example-uuid', data: { name: 'obj1' } }); // data is ignored if id is provided
testCRUD.update({ id: 'example-uuid', date: { name: 'obj2' }}); // returns a Promise with the updated element
testCRUD.delete({ id: 'example-uuid' }); // returns a Promise with the deleted element
```

## Notes

You can use `mongoose-plugin-events` with this library to have the model emit the
create/update/delete events.
