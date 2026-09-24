(function (root) {
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  function validDate(value) {
    return DATE_PATTERN.test(String(value || ''));
  }

  function normalizeHistoryTodos(todos = [], today = '') {
    return todos.map(todo => ({
      ...todo,
      createdOn: validDate(todo?.createdOn) ? todo.createdOn : today,
      completedOn: todo?.done
        ? (validDate(todo?.completedOn) ? todo.completedOn : today)
        : ''
    }));
  }

  function visibleTodosForDate(todos = [], today = '') {
    return todos.filter(todo => !todo?.done || !validDate(todo?.completedOn) || todo.completedOn >= today);
  }

  function buildHistoryEntries({ todos = [], tasks = [] } = {}) {
    const todoEntries = todos.map(todo => ({
      kind: 'todo', id: todo.id, title: todo.title || '', done: Boolean(todo.done),
      createdOn: todo.createdOn || '', completedOn: todo.completedOn || '',
      dueDate: todo.date || '', dueTime: todo.time || ''
    }));
    const taskEntries = tasks.map(task => ({
      kind: 'task', id: task.id, title: task.title || '', done: Boolean(task.done),
      createdOn: task.createdOn || '', completedOn: task.completedOn || '',
      dueDate: '', dueTime: ''
    }));
    return [...todoEntries, ...taskEntries].sort((a, b) => {
      const aDate = a.completedOn || a.createdOn || a.dueDate || '';
      const bDate = b.completedOn || b.createdOn || b.dueDate || '';
      return bDate.localeCompare(aDate) || a.title.localeCompare(b.title);
    });
  }

  function filterHistoryEntries(entries = [], { query = '', type = 'all', status = 'all' } = {}) {
    const needle = String(query).trim().toLocaleLowerCase();
    return entries.filter(entry => {
      if (type !== 'all' && entry.kind !== type) return false;
      if (status === 'open' && entry.done) return false;
      if (status === 'done' && !entry.done) return false;
      if (!needle) return true;
      const searchable = [entry.title, entry.createdOn, entry.completedOn, entry.dueDate, entry.dueTime]
        .join(' ').toLocaleLowerCase();
      return searchable.includes(needle);
    });
  }

  const api = Object.freeze({ normalizeHistoryTodos, visibleTodosForDate, buildHistoryEntries, filterHistoryEntries });
  root.UniFlowHistory = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
