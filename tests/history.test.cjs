const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeHistoryTodos, buildHistoryEntries, filterHistoryEntries } = require('../dist/history.js');

test('normalizes legacy todo history without losing deadlines', () => {
  const todos = normalizeHistoryTodos([
    { id: 'open', title: '公司法阅读', date: '2026-09-25', done: false },
    { id: 'done', title: '提交算法作业', date: '2026-09-21', done: true }
  ], '2026-09-22');
  assert.equal(todos[0].createdOn, '2026-09-22');
  assert.equal(todos[0].completedOn, '');
  assert.equal(todos[1].completedOn, '2026-09-22');
});

test('builds and filters combined todo and task history', () => {
  const entries = buildHistoryEntries({
    todos: [{ id: 'todo-1', title: '概率论作业', date: '2026-09-25', time: '23:00', done: false, createdOn: '2026-09-22' }],
    tasks: [{ id: 'task-1', title: '练声', done: true, createdOn: '2026-09-21', completedOn: '2026-09-22' }]
  });
  assert.equal(entries.length, 2);
  assert.deepEqual(filterHistoryEntries(entries, { query: '概率', type: 'all', status: 'all' }).map(entry => entry.id), ['todo-1']);
  assert.deepEqual(filterHistoryEntries(entries, { type: 'task', status: 'done' }).map(entry => entry.id), ['task-1']);
  assert.equal(filterHistoryEntries(entries, { type: 'todo', status: 'done' }).length, 0);
});

test('history search accepts exact dates', () => {
  const entries = buildHistoryEntries({
    todos: [{ id: 'todo-1', title: '金融法笔记', date: '2026-10-03', done: false, createdOn: '2026-09-22' }]
  });
  assert.equal(filterHistoryEntries(entries, { query: '2026-10-03' }).length, 1);
});
