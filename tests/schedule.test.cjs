const test = require('node:test');
const assert = require('node:assert/strict');
const { locationFromText, periodSpan, periodTimes, excludeCourseOccurrence, isCourseOccurrenceExcluded, mergeUniqueCourses, normalizeDailyTasks, dailyTasksForDate, isTaskCarried, taskCarryLabelDate } = require('../dist/schedule.js');

test('recognizes and preserves classroom codes', () => {
  assert.equal(locationFromText('星期一 1~3节 H2205 张老师'), 'H2205');
  assert.equal(locationFromText('MATH20007.01 1~16周 H3316'), 'H3316');
  assert.equal(locationFromText('CS40008.01 星期三 6~8节 GHX108 周老师'), 'GHX108');
  assert.equal(locationFromText('地点: H 2205'), 'H2205');
  assert.equal(locationFromText('MATH20007.01'), '');
  assert.equal(locationFromText('地点：邯郸校区'), '邯郸校区');
});

test('uses the supplied class start and end times as the week axis', () => {
  assert.deepEqual(periodTimes[1], ['08:00', '08:45']);
  assert.deepEqual(periodTimes[14], ['21:15', '22:00']);
  assert.deepEqual(periodSpan('08:00', '10:40'), { first: 1, last: 3, span: 3 });
  assert.deepEqual(periodSpan('13:30', '16:10'), { first: 6, last: 8, span: 3 });
  assert.deepEqual(periodSpan('18:30', '21:05'), { first: 11, last: 13, span: 3 });
});

test('excludes only one weekly course occurrence', () => {
  const course = { id: 'course-1', title: '数值算法与案例分析I' };
  excludeCourseOccurrence(course, '2026-09-21');
  assert.equal(isCourseOccurrenceExcluded(course, '2026-09-21'), true);
  assert.equal(isCourseOccurrenceExcluded(course, '2026-09-28'), false);
});

test('merges a second timetable without overwriting or duplicating courses', () => {
  const existing = [{ id: 'old', title: '数值算法与案例分析I', weekday: 2, start: '08:00', place: 'H3406' }];
  const incoming = [
    { id: 'duplicate', title: '数值算法与案例分析I', weekday: 2, start: '08:00', place: 'H3406' },
    { id: 'new', title: '应用泛函分析', weekday: 3, start: '08:00', place: 'HGX504' },
    { id: 'new-copy', title: '应用泛函分析', weekday: 3, start: '08:00', place: 'HGX504' }
  ];
  const result = mergeUniqueCourses(existing, incoming);
  assert.deepEqual(result.additions.map(course => course.id), ['new']);
  assert.equal(result.skipped, 2);
  assert.equal(existing[0].place, 'H3406');
});

test('carries unfinished daily tasks forward and hides earlier completed tasks', () => {
  const tasks = normalizeDailyTasks([
    { id: 'unfinished', title: '复习线性代数', done: false, createdOn: '2026-09-21' },
    { id: 'done-yesterday', title: '提交作业', done: true, createdOn: '2026-09-21', completedOn: '2026-09-21' },
    { id: 'done-today', title: '练声', done: true, createdOn: '2026-09-21', completedOn: '2026-09-22' }
  ], '2026-09-22');
  const visible = dailyTasksForDate(tasks, '2026-09-22');
  assert.deepEqual(visible.map(task => task.id), ['unfinished', 'done-today']);
  assert.equal(isTaskCarried(visible[0], '2026-09-22'), true);
  assert.equal(isTaskCarried(visible[1], '2026-09-22'), false);
});

test('migrates legacy daily tasks without losing them', () => {
  const tasks = normalizeDailyTasks([
    { id: 'open', title: '整理笔记', done: false },
    { id: 'done', title: '喝水', done: true }
  ], '2026-09-22');
  assert.equal(tasks[0].createdOn, '2026-09-22');
  assert.equal(tasks[0].completedOn, '');
  assert.equal(tasks[1].createdOn, '2026-09-22');
  assert.equal(tasks[1].completedOn, '2026-09-22');
});

test('changes or hides a carried-task label without changing task history', () => {
  const task = { id: 'carried', title: '复习概率论', done: false, createdOn: '2026-09-21' };
  assert.equal(taskCarryLabelDate(task, '2026-09-23'), '2026-09-21');
  assert.equal(taskCarryLabelDate({ ...task, carryFrom: '2026-09-22' }, '2026-09-23'), '2026-09-22');
  assert.equal(taskCarryLabelDate({ ...task, showCarryLabel: false }, '2026-09-23'), '');
  assert.equal(taskCarryLabelDate({ ...task, done: true }, '2026-09-23'), '');
  assert.equal(task.createdOn, '2026-09-21');
});
