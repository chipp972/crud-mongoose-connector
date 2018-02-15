// @flow
import { expect } from 'chai';
import { Mockgoose } from 'mockgoose';
import mongoose from 'mongoose';
import eventsPlugin from 'mongoose-plugin-events';
import { SinonSpy, spy } from 'sinon';
import { mongooseCrudConnector } from '../src/index';
import { MongooseCrudModel } from '../src/index';

interface TestModel {
  _id: string;
  name: string;
  anotherField?: Date;
}

let operations: MongooseCrudModel<TestModel>;
let db: mongoose.Connection;
let createSpy: SinonSpy;
let updateSpy: SinonSpy;
let deleteSpy: SinonSpy;

const mockgoose: Mockgoose = new Mockgoose(mongoose);
const schema = new mongoose.Schema({
  anotherField: Date,
  name: { type: String, required: true },
});
schema.plugin(eventsPlugin, {});

describe('Mongoose Crud Connector', function() {
  before(async function() {
    await mockgoose.prepareStorage();
    db = await mongoose.createConnection('mongodb://example.com/TestingDB');
  });

  beforeEach(async function() {
    await mockgoose.helper.reset();
    createSpy = spy();
    updateSpy = spy();
    deleteSpy = spy();
    const model = db
      .model('test', schema)
      .on('created', createSpy)
      .on('updated', updateSpy)
      .on('removed', deleteSpy);
    operations = mongooseCrudConnector(model);
  });

  it('create operation', async function() {
    const obj = await operations.create({ data: { name: 'test' } });
    expect(obj).to.be.an('object');
    expect(obj).to.have.property('_id').which.is.not.empty;
    expect(obj).to.have.property('__v', 0);
    expect(obj).to.have.property('name', 'test');
    expect(createSpy.called).to.be.true;
    expect(createSpy.calledWithExactly(obj)).to.be.true;
  });

  it('create operation with bad data', async function() {
    expect(operations.create.bind({ data: {} })).to.throw();
    expect(createSpy.called).to.be.false;
  });

  it('read operation without param', async function() {
    const obj1 = await operations.create({ data: { name: 'test' } });
    const obj2 = await operations.create({ data: { name: 'test' } });
    const res = await operations.read({});
    expect(res).to.deep.equal([obj1, obj2]);
  });

  it('read operation with id', async function() {
    const obj = await operations.create({ data: { name: 'test' } });
    const res = await operations.read({ id: obj._id });
    expect(res).to.deep.equal(obj);
  });

  it('update operation', async function() {
    const obj = await operations.create({ data: { name: 'test' } });
    const res = await operations.update({
      id: obj._id,
      data: { name: 'test8' },
    });
    if (!res) throw new Error('Update failed : no result');
    expect(res).to.be.an('object');
    expect(res._id).to.deep.equal(obj._id);
    expect(res).to.have.property('__v', 0);
    expect(res).to.have.property('name', 'test8');
    expect(updateSpy.called).to.be.true;
  });

  it('update operation with invalid id', async function() {
    expect(
      operations.update.bind({
        id: 'id1',
        data: { name: 'test8' },
      }),
    ).to.throw;
    expect(updateSpy.called).to.be.false;
  });

  it('delete operation', async function() {
    const obj = await operations.create({ data: { name: 'test' } });
    const res = await operations.delete({ id: obj._id });
    const findRes = await operations.read({});
    if (!res) throw new Error('Delete failed : no result');
    expect(res).to.be.an('object');
    expect(res._id).to.deep.equal(obj._id);
    expect(res).to.have.property('__v', 0);
    expect(res).to.have.property('name', 'test');
    expect(deleteSpy.called).to.be.true;
    expect(deleteSpy.calledWithExactly(obj)).to.be.true;
    expect(findRes).to.deep.equal([]);
  });
});
