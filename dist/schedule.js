(function (root) {
  const periodTimes = Object.freeze({
    1: ['08:00', '08:45'], 2: ['08:55', '09:40'], 3: ['09:55', '10:40'], 4: ['10:50', '11:35'],
    5: ['11:45', '12:30'], 6: ['13:30', '14:15'], 7: ['14:25', '15:10'], 8: ['15:25', '16:10'],
    9: ['16:20', '17:05'], 10: ['17:15', '18:00'], 11: ['18:30', '19:15'], 12: ['19:25', '20:10'],
    13: ['20:20', '21:05'], 14: ['21:15', '22:00']
  });
  const periods = Object.entries(periodTimes).map(([number, [start, end]]) => ({ number: Number(number), start, end }));

  function locationFromText(text) {
    const source = String(text || '');
    const room = /(?:^|[^A-Za-z0-9])([A-Za-z]{1,5}[\s-]*\d{3,4}[A-Za-z]?)(?![\d.])/g;
    const labelled = source.match(/(?:上课地点|地点|教室|room|location)\s*[:：]?\s*([^\s,，;；]{2,24})/i);
    const labelledCode = labelled?.[1]?.match(room)?.[0]?.trim();
    if (labelledCode) return labelledCode.replace(/[\s-]+/g, '').toUpperCase();
    const found = room.exec(source);
    if (found) return found[1].replace(/[\s-]+/g, '').toUpperCase();
    return labelled?.[1] || '';
  }

  function periodIndexForStart(time) {
    if (!/^\d{2}:\d{2}$/.test(time || '')) return 0;
    const beforeOrWithin = periods.findIndex(period => time <= period.end || time < period.start);
    return beforeOrWithin < 0 ? periods.length - 1 : beforeOrWithin;
  }

  function periodIndexForEnd(time) {
    if (!/^\d{2}:\d{2}$/.test(time || '')) return 0;
    const beforeOrWithin = periods.findIndex((period, index) => time <= period.end || (index + 1 < periods.length && time < periods[index + 1].start));
    return beforeOrWithin < 0 ? periods.length - 1 : beforeOrWithin;
  }

  function periodSpan(start, end) {
    const first = periodIndexForStart(start);
    const last = end ? Math.max(first, periodIndexForEnd(end)) : first;
    return { first: first + 1, last: last + 1, span: last - first + 1 };
  }

  function excludeCourseOccurrence(course, date) {
    const dateString = String(date || '');
    if (!course || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return course;
    course.excludedDates = [...new Set([...(course.excludedDates || []), dateString])];
    return course;
  }

  function isCourseOccurrenceExcluded(course, date) {
    return Boolean(course?.excludedDates?.includes(String(date || '')));
  }

  function courseIdentity(course) {
    return `${String(course?.title || '').trim()}|${Number(course?.weekday)}|${String(course?.start || '').trim()}`.toLowerCase();
  }

  function mergeUniqueCourses(existing = [], incoming = []) {
    const identities = new Set(existing.map(courseIdentity));
    const additions = [];
    let skipped = 0;
    incoming.forEach(course => {
      const identity = courseIdentity(course);
      if (identities.has(identity)) {
        skipped += 1;
        return;
      }
      identities.add(identity);
      additions.push(course);
    });
    return { additions, skipped };
  }

  function normalizeDailyTasks(tasks = [], today = '') {
    return tasks.map(task => ({
      ...task,
      createdOn: /^\d{4}-\d{2}-\d{2}$/.test(task?.createdOn || '') ? task.createdOn : today,
      completedOn: task?.done
        ? (/^\d{4}-\d{2}-\d{2}$/.test(task?.completedOn || '') ? task.completedOn : today)
        : ''
    }));
  }

  function dailyTasksForDate(tasks = [], today = '') {
    return tasks.filter(task => !task.done || task.completedOn === today);
  }

  function isTaskCarried(task, today = '') {
    return Boolean(!task?.done && /^\d{4}-\d{2}-\d{2}$/.test(task?.createdOn || '') && task.createdOn < today);
  }

  function taskCarryLabelDate(task, today = '') {
    if (!isTaskCarried(task, today) || task?.showCarryLabel === false) return '';
    const candidate = task?.carryFrom || task?.createdOn || '';
    return /^\d{4}-\d{2}-\d{2}$/.test(candidate) ? candidate : '';
  }

  const api = Object.freeze({ periodTimes, periods, locationFromText, periodSpan, excludeCourseOccurrence, isCourseOccurrenceExcluded, courseIdentity, mergeUniqueCourses, normalizeDailyTasks, dailyTasksForDate, isTaskCarried, taskCarryLabelDate });
  root.UniFlowSchedule = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
