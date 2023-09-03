import { describe, it, beforeEach, afterEach, before, after } from 'node:test';
import assert from 'node:assert';
import crypto from 'node:crypto';
import TodoService from '../src/todoService.js';
import Todo from '../src/todo.js';
import sinon from 'sinon';

describe('todoService test Suite', () => {
  describe('#list', () => {
    let _todoService;
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
        todoRepository: {
          list: context.mock.fn(async () => mockDatabase)
        }
      };
      _todoService = new TodoService(_dependencies);
    });

    it('should return a list of items with uppercase text', async () => {
      //Arrange
      const expected = mockDatabase.map(({text, ...result}) => (new Todo({text: text.toUpperCase(), ...result})));
      const fnMock = _dependencies.todoRepository.list.mock;
      
      //Act
      const result = await _todoService.list();
      
      //Assert
      assert.strictEqual(fnMock.callCount(), 1);
      assert.deepStrictEqual(result, expected);
    });
  });

  describe('#create', () => {
    let _todoService;
    let _dependencies;
    let _sandBox;

    const mockCreateResult = {
      text: 'I must plan my trip to Europe',
      when: new Date('2021-03-22T00:00:00.000Z'),
      status: 'late',
      id: '2dabce39-df2c-4228-8638-89640d46aa75'
    };

    const DEFAULT_ID = mockCreateResult.id;
    before(() => {
      crypto.randomUUID = () => DEFAULT_ID;
      _sandBox = sinon.createSandbox();
    });
    after(async () => {
      crypto.randomUUID = (await import('node:crypto')).randomUUID
    });


    beforeEach((context) => {
      _dependencies = {
        todoRepository: {
          create: context.mock.fn(async () => mockCreateResult)
        }
      };
      _todoService = new TodoService(_dependencies);
    });

    afterEach(() => {
      _sandBox.restore();
    });

    it('should not save todo item with invalid text', async () => {
      //Arrange
      const invalidTextTodo = new Todo({ text: null, when: new Date() });
      const expected = {
        error: {
            message: 'invalid data',
            data: invalidTextTodo
        }
      }
      const fnMock = _dependencies.todoRepository.create.mock;

      //Act
      const result = await _todoService.create(invalidTextTodo);

      //Assert
      assert.strictEqual(fnMock.callCount(), 0);
      assert.deepStrictEqual(result, expected);
    });

    it('should not save todo item with invalid whenDate', async () => {
      //Arrange
      const invalidTextTodo = new Todo({ text: 'text valid', when: 'abc' });
      const expected = {
        error: {
            message: 'invalid data',
            data: invalidTextTodo
        }
      }
      const fnMock = _dependencies.todoRepository.create.mock;

      //Act
      const result = await _todoService.create(invalidTextTodo);

      //Assert
      assert.strictEqual(fnMock.callCount(), 0);
      assert.deepStrictEqual(result, expected);
    });

    it('should save todo item with "late" status when the property is further than today', async () => {
      //Arrange
      const properties = {
        text: 'I must plan my vacation',
        when: new Date('2024-12-01 12:00:00 GMT-0')
      };
      const fnMock = _dependencies.todoRepository.create.mock;
      const input = new Todo(properties); 

      const expected = {
        ...properties,
        status: 'late',
        id: DEFAULT_ID
      }

      const today = new Date('2024-12-02 12:00:00 GMT-0');
      _sandBox.useFakeTimers(today.getTime());

      //Act
      await _todoService.create(input);

      //Assert
      assert.strictEqual(fnMock.callCount(), 1);
      assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected);
    });

    it('should save todo item with "pending" status when the property is in the past', async () => {
      //Arrange
      const properties = {
        text: 'I must plan my vacation',
        when: new Date('2024-12-05 12:00:00 GMT-0')
      };
      const fnMock = _dependencies.todoRepository.create.mock;
      const input = new Todo(properties); 

      const expected = {
        ...properties,
        status: 'pending',
        id: DEFAULT_ID
      }

      const today = new Date('2024-12-02 12:00:00 GMT-0');
      _sandBox.useFakeTimers(today.getTime());

      //Act
      await _todoService.create(input);

      //Assert
      assert.strictEqual(fnMock.callCount(), 1);
      assert.deepStrictEqual(fnMock.calls[0].arguments[0], expected);
    });

  });
});