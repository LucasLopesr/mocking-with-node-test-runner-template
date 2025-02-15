import Todo from './todo.js';

export default class TodoRepository {
    #schedule
    constructor({ db }) {
      this.#schedule = db.addCollection('schedule');
    }

    async list() {
        // deveria ser um .project() mas não temos no lokijs
        return this.#schedule.find().map(({ meta, $loki, ...result }) => new Todo({...result}));
    }

    async create(data) {
        const {$loki, meta, ...result } = this.#schedule.insertOne(data);
        return new Todo({...result});
    }
}



// const c = new TodoRepository()

// c.create({ name: 'XuxaDaSilva', age: 90})
// c.create({ name: 'Joaozinho', age: 90})

// console.log('list', c.list())