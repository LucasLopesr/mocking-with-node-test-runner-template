import { describe, it, beforeEach, afterEach, before, after } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import TodoRepository from '../src/todoRepository.js';
import Todo from '../src/todo.js';

describe('todoRepository test Suite', () => {
  describe('#list', () => {
    let _todoRepository;
    let _dependencies;
    const mockDatabase = [
      {
        text: 'I Must Plan My trip to europe',
        when: new Date('2021-03-22T00:00:00.000Z'),
        status: 'late',
        id: '13fac0f7-2647-421d-a3fb-26018233c2d8'
      }
    ];

    beforeEach((context) => {

      _dependencies = {
        db: {
          addCollection: context.mock.fn(() => {
            return {
              find: context.mock.fn(() => mockDatabase)
            }
          }),
        }
      };
      _todoRepository = new TodoRepository(_dependencies);
    });

    it('should return data', async () => {
      const expectedData = [
        new Todo({
          text: 'I Must Plan My trip to europe',
          when: new Date('2021-03-22T00:00:00.000Z'),
          status: 'late',
          id: '13fac0f7-2647-421d-a3fb-26018233c2d8'
        })
      ];
    
      const result = await _todoRepository.list();
    
      assert.deepStrictEqual(result,expectedData);
    });
  });

  describe('#create', () => {
    let _todoRepository;
    let _dependencies;
    const mockCreateResult = {
      text: 'I must plan my trip to Europe',
      when: new Date('2021-03-22T00:00:00.000Z'),
      status: 'late',
      id: '2dabce39-df2c-4228-8638-89640d46aa75'
    };

    const DEFAULT_ID = mockCreateResult.id;
    before(() => {
      crypto.randomUUID = () => DEFAULT_ID;
    });

    after(async () => {
      crypto.randomUUID = (await import('node:crypto')).randomUUID
    });


    beforeEach((context) => {
      _dependencies = {
        db: {
          addCollection: context.mock.fn(() => {
            return {
              insertOne: context.mock.fn(() => mockCreateResult)
            }
          }),
        }
      };
      _todoRepository = new TodoRepository(_dependencies);
    });

    it('should insert data and return this one', async () => {
      const expectedData = 
        new Todo({
          text: 'I must plan my trip to Europe',
          when: new Date('2021-03-22T00:00:00.000Z'),
          status: 'late',
          id: '2dabce39-df2c-4228-8638-89640d46aa75'
        });
    
      const result = await _todoRepository.create(expectedData);
    
      assert.deepStrictEqual(result,expectedData);
    });
  });
});