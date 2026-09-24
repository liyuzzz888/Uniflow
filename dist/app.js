const DAY = 86400000;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const { periodTimes, periods, locationFromText, periodSpan, excludeCourseOccurrence, isCourseOccurrenceExcluded, mergeUniqueCourses, normalizeDailyTasks, dailyTasksForDate, taskCarryLabelDate } = window.UniFlowSchedule;
const { normalizeHistoryTodos, visibleTodosForDate, buildHistoryEntries, filterHistoryEntries } = window.UniFlowHistory;

const dictionary = {
  brandSub: ['大学时序', 'Campus time'], today: ['今日', 'Today'], week: ['本周', 'Week'], todo: ['待办', 'Todo'], history: ['历史', 'History'],
  courses: ['课程', 'Courses'], import: ['导入课表', 'Import'], settings: ['设置', 'Settings'], addPlan: ['添加安排', 'Add plan'],
  preferences: ['偏好设置', 'Preferences'], name: ['称呼', 'Name'], nameHelp: ['仅保存在这台设备', 'Saved only on this device'], rikoCredit: ['riko 倾情呈现', 'Presented with care by riko'],
  appearance: ['外观', 'Appearance'], light: ['浅色', 'Light'], system: ['自动', 'Auto'], dark: ['深色', 'Dark'], fontSize: ['字号', 'Text size'],
  compact: ['紧凑', 'Compact'], standard: ['标准', 'Standard'], comfortable: ['舒适', 'Comfortable'], language: ['语言', 'Language'],
  courseMode: ['课表模式', 'Course mode'], courseModeHelp: ['在时间表中显示课程', 'Show courses in schedule'], semester: ['当前学期', 'Semester'],
  localFirst: ['本地优先', 'Local first'], localFirstHelp: ['所有更改只保存在这台设备，不需要登录。', 'Changes stay on this device. No account needed.'],
  newItem: ['新建', 'New'], plan: ['安排', 'Plan'], task: ['小任务', 'Task'], course: ['课程', 'Course'], title: ['标题', 'Title'], date: ['日期', 'Date'], deadlineDate: ['截止日期', 'Deadline date'], time: ['时间', 'Time'],
  weekday: ['星期', 'Weekday'], startTime: ['开始时间', 'Start time'], endTime: ['结束时间', 'End time'], locationOptional: ['上课地点（可选）', 'Classroom (optional)'], planLocationOptional: ['地点（可选）', 'Location (optional)'], addCourse: ['添加课程', 'Add course'], addTodo: ['添加待办', 'Add todo'], edit: ['编辑', 'Edit'], editCourse: ['编辑课程', 'Edit course'], editPlan: ['编辑安排', 'Edit plan'], editTask: ['编辑小任务', 'Edit small task'], editTodo: ['编辑待办', 'Edit todo'], updated: ['已更新', 'Updated'],
  weeksOptional: ['上课周数（可选）', 'Weeks (optional)'], semesterStart: ['学期第一周', 'First week of semester'], weekNumber: ['第 {n} 周', 'Week {n}'],
  weeksNotFound: ['周数未识别，请对照原图核对；留空将按每周上课。', 'Weeks not recognized. Check the image; blank means every week.'],
  showSchedule: ['显示在时间表', 'Show in schedule'], cancel: ['取消', 'Cancel'], save: ['保存', 'Save'], delete: ['删除', 'Delete'], deleteThis: ['删除此项', 'Delete item'], removeThisWeek: ['仅从本周移除', 'Remove this week only'], removedThisWeek: ['已从本周移除', 'Removed from this week'], deleted: ['已删除', 'Deleted'], deleteItemQuestion: ['确定删除“{title}”？', 'Delete “{title}”?'], deleteOccurrenceQuestion: ['只删除本周的“{title}”？', 'Remove “{title}” from this week?'], deleteOccurrenceHelp: ['只移除本周这一次课程，其他周的课程保持不变。', 'Only this week’s occurrence will be removed. Other weeks stay unchanged.'], deleteItemHelp: ['删除后无法恢复。', 'This cannot be undone.'], deleteCourseHelp: ['这门课会从所有周的课表中移除，删除后无法恢复。', 'This course will be removed from every week. This cannot be undone.'],
  todaySchedule: ['今天的时间表', "Today's schedule"], otherPlans: ['其他安排', 'Other plans'], todayTasks: ['今日小任务', "Today's tasks"],
  noPlans: ['今天还没有其他安排', 'No other plans today'], addTask: ['添加一个小任务', 'Add a small task'], carriedTask: ['延续自 {date}', 'Carried from {date}'], carryLabelDate: ['延续标签日期', 'Carry label date'], showCarryLabel: ['显示“延续自”标签', 'Show “Carried from” label'], courseModeOn: ['课表模式', 'Course mode'], freeMode: ['自由模式', 'Free mode'],
  thisWeek: ['本周时间表', 'Weekly schedule'], scheduleHint: ['课程、安排与已选择的待办', 'Courses, plans, and selected todos'],
  deadlines: ['截止事项', 'Deadlines'], deadlinesHint: ['每项都显示具体截止日期；可拖到已有日期调整', 'Every item shows its exact deadline. Drag it to an existing date to reschedule.'],
  open: ['未完成', 'Open'], completed: ['已完成', 'Done'], todayGroup: ['今天', 'Today'], tomorrow: ['明天', 'Tomorrow'], later: ['之后', 'Later'], noDeadline: ['待补截止日期', 'Deadline needed'], allDay: ['全天', 'All day'],
  historyTitle: ['历史与查询', 'History & search'], historyHint: ['统一查找待办和小任务，记录只保存在本机', 'Find todos and small tasks. History stays on this device.'], openHistory: ['历史与查询', 'History & search'], backToTodos: ['返回待办', 'Back to todos'], searchHistory: ['搜索标题或日期', 'Search title or date'], allTypes: ['全部类型', 'All types'], todosOnly: ['仅待办', 'Todos'], tasksOnly: ['仅小任务', 'Small tasks'], allStatuses: ['全部状态', 'All statuses'], openStatus: ['未完成', 'Open'], doneStatus: ['已完成', 'Done'], historyResults: ['{n} 条记录', '{n} results'], noHistory: ['没有符合条件的记录', 'No matching history'], createdOn: ['创建于', 'Created'], completedOn: ['完成于', 'Completed'], dueOn: ['截止', 'Due'],
  scheduleShown: ['显示在时间表', 'Shown in schedule'], courseList: ['课程列表', 'Courses'], courseHint: ['当前学期的常规课程模板', 'Regular course template for this semester'],
  every: ['每周', 'Every'], importTitle: ['从截图导入课表', 'Import from screenshot'], importHint: ['先识别，再由你确认；不会直接改动正式课表。', 'Review recognized courses before anything is added.'],
  chooseImage: ['选择课表图片', 'Choose image'], dropCopy: ['拖入课表图片', 'Drop a timetable image'], pasteImage: ['也可以复制图片后按 ⌘V', 'Or copy the image and press ⌘V'], reviewFlow: ['导入流程', 'Import flow'],
  readImage: ['读取图片', 'Read image'], readImageHelp: ['图片只用于本地预览与识别。', 'The image stays on this device.'], recognize: ['识别课程', 'Recognize courses'], recognizeHelp: ['提取课程名、时间、地点与周数。', 'Extract course, time, room, and weeks.'],
  review: ['检查确认', 'Review'], reviewHelp: ['确认候选课程后再写入课表。', 'Approve candidates before adding them.'], privateImport: ['图片只在本机识别；候选课程需由你确认。', 'Images are recognized on-device; review courses before adding them.'],
  conflict: ['时间冲突', 'Time conflict'], syncedLocal: ['已保存在本机', 'Saved locally'], added: ['已添加', 'Added'], moved: ['截止日期已更新', 'Deadline updated'],
  imported: ['图片识别完成', 'Image recognition complete'], noCourse: ['自由模式已隐藏课程', 'Courses hidden in free mode'],
  candidate: ['识别到的课程', 'Recognized courses'], addCandidates: ['确认导入', 'Confirm import'],
  startTitle: ['从你的课表开始', 'Start with your timetable'], startHelp: ['导入一张课表截图，确认后再写入课程。', 'Import a screenshot, review it, then add the courses.'],
  startImport: ['导入课表', 'Import timetable'], skipForNow: ['暂时跳过', 'Skip for now'], emptySchedule: ['时间表还是空的', 'Your schedule is empty'],
  emptyScheduleHelp: ['导入课表或添加第一项安排。', 'Import a timetable or add your first plan.'], clearTimetable: ['清除课表', 'Clear timetable'],
  clearTimetableQuestion: ['清除全部课程？', 'Clear all courses?'], clearTimetableHelp: ['只会清除课程，不影响安排、小任务和待办。', 'Only courses will be removed. Plans, tasks, and todos stay.'],
  clear: ['清除', 'Clear'], timetableCleared: ['课表已清除', 'Timetable cleared'], importComplete: ['课程已导入', 'Courses imported'], importMerged: ['已添加 {added} 门，跳过 {skipped} 门重复课程', 'Added {added}; skipped {skipped} duplicate courses'], importNoNew: ['没有新增课程，重复课程已保留原记录', 'No new courses. Existing duplicates were kept unchanged.'],
  dropUnsupported: ['没有找到可读取的图片，请复制图片后按 ⌘V，或先保存到本地。', 'No readable image was found. Copy it and press ⌘V, or save it first.'],
  imageAccepted: ['已接收课表图片', 'Timetable image received'], notImage: ['请选择图片文件', 'Please choose an image file'],
  pasteButton: ['粘贴图片', 'Paste image'], clipboardEmpty: ['剪贴板里没有图片，请先复制课表图片。', 'No image found. Copy the timetable image first.'],
  clipboardDenied: ['无法读取剪贴板，请直接按 ⌘V，或允许浏览器读取剪贴板。', 'Could not read the clipboard. Press ⌘V directly or allow clipboard access.'],
  imageReadyTitle: ['图片已导入', 'Image imported'], imageReadyHelp: ['点击开始识别；正式课表在你确认前不会改变。', 'Start recognition when ready. Your timetable will not change before confirmation.'],
  startRecognition: ['开始识别', 'Start recognition'], recognizing: ['正在识别课表', 'Recognizing timetable'], preparingOcr: ['正在准备识别引擎…', 'Preparing recognition engine…'],
  firstDownloadHint: ['识别模型已包含在应用内，断网也可以使用。', 'The recognition model is included and works offline.'],
  recognitionFailed: ['识别失败，请换一张更清晰的图片或手动添加。', 'Recognition failed. Try a clearer image or add courses manually.'],
  noStructuredCourses: ['文字已经识别，但没有找到同时包含星期与上课时间的课程。你可以查看原文或手动添加。', 'Text was recognized, but no course with both a weekday and time was found. Review the text or add it manually.'],
  noOcrText: ['没有识别到文字，请换一张清晰、完整的截图。', 'No text was recognized. Try a clearer, complete screenshot.'],
  rawText: ['识别原文', 'Recognized text'], confirmRecognized: ['确认导入识别课程', 'Import recognized courses'],
  addManually: ['手动录入课表', 'Enter timetable manually'], replaceImage: ['换一张图片', 'Choose another image']
};

const japanese = {
  brandSub: '大学時序', today: '今日', week: '今週', todo: 'ToDo', history: '履歴', courses: '授業', import: '時間割を読み込む', settings: '設定', addPlan: '予定を追加',
  preferences: '環境設定', name: '呼び名', nameHelp: 'この端末にのみ保存', rikoCredit: 'rikoより、心を込めて', appearance: '外観', light: 'ライト', system: '自動', dark: 'ダーク',
  fontSize: '文字サイズ', compact: '小さめ', standard: '標準', comfortable: '大きめ', language: '言語', courseMode: '時間割モード', courseModeHelp: 'スケジュールに授業を表示', semester: '現在の学期',
  localFirst: 'ローカル優先', localFirstHelp: '変更はこの端末だけに保存されます。ログインは不要です。', newItem: '新規', plan: '予定', task: '小さなタスク', course: '授業', title: 'タイトル', date: '日付', deadlineDate: '締切日', time: '時刻',
  weekday: '曜日', startTime: '開始時刻', endTime: '終了時刻', locationOptional: '教室（任意）', planLocationOptional: '場所（任意）', addCourse: '授業を追加', addTodo: 'ToDoを追加', edit: '編集', editCourse: '授業を編集', editPlan: '予定を編集', editTask: '小さなタスクを編集', editTodo: 'ToDoを編集', updated: '更新しました',
  weeksOptional: '授業週（任意）', semesterStart: '学期の第1週', weekNumber: '第 {n} 週',
  weeksNotFound: '授業週を認識できませんでした。原画像を確認してください。空欄は毎週の授業になります。',
  showSchedule: '時間表に表示', cancel: 'キャンセル', save: '保存', delete: '削除', deleteThis: 'この項目を削除', removeThisWeek: '今週だけ削除', removedThisWeek: '今週の授業を削除しました', deleted: '削除しました', deleteItemQuestion: '「{title}」を削除しますか？', deleteOccurrenceQuestion: '今週の「{title}」だけを削除しますか？', deleteOccurrenceHelp: '今週の授業だけを削除し、ほかの週はそのまま残します。', deleteItemHelp: '削除すると元に戻せません。', deleteCourseHelp: 'この授業はすべての週の時間割から削除されます。元に戻せません。', todaySchedule: '今日のスケジュール', otherPlans: 'その他の予定', todayTasks: '今日のタスク',
  noPlans: '今日の予定はまだありません', addTask: 'タスクを追加', carriedTask: '{date}から継続', carryLabelDate: '継続ラベルの日付', showCarryLabel: '「〜から継続」ラベルを表示', courseModeOn: '時間割モード', freeMode: 'フリーモード', thisWeek: '今週の時間割', scheduleHint: '授業・予定・選択したToDo',
  deadlines: '締切タスク', deadlinesHint: 'すべての項目に具体的な締切日を表示します。既存の日付へドラッグして変更できます。', open: '未完了', completed: '完了', todayGroup: '今日', tomorrow: '明日', later: 'それ以降', noDeadline: '締切日を設定', allDay: '終日',
  historyTitle: '履歴と検索', historyHint: 'ToDoと小さなタスクをまとめて検索します。履歴はこの端末にのみ保存されます。', openHistory: '履歴と検索', backToTodos: 'ToDoに戻る', searchHistory: 'タイトルまたは日付を検索', allTypes: 'すべての種類', todosOnly: 'ToDoのみ', tasksOnly: '小さなタスクのみ', allStatuses: 'すべての状態', openStatus: '未完了', doneStatus: '完了', historyResults: '{n}件', noHistory: '条件に一致する履歴はありません', createdOn: '作成', completedOn: '完了', dueOn: '締切',
  scheduleShown: '時間表に表示', courseList: '授業一覧', courseHint: '現在の学期の通常時間割', every: '毎週', importTitle: '画像から時間割を読み込む', importHint: '認識結果を確認してから時間割に追加します。',
  chooseImage: '画像を選択', dropCopy: '時間割画像をドラッグ', pasteImage: '画像をコピーして⌘Vでも追加できます', reviewFlow: '読み込み手順', readImage: '画像を読み取る', readImageHelp: '画像は端末内でのみプレビューします。', recognize: '授業を認識', recognizeHelp: '授業名、時刻、教室、週を抽出します。',
  review: '確認', reviewHelp: '候補を確認してから時間割に追加します。', privateImport: '画像は端末内で認識します。候補は確認してから追加されます。', conflict: '時間の重複', syncedLocal: '端末に保存しました', added: '追加しました', moved: '締切日を更新しました',
  imported: '画像の認識が完了しました', noCourse: 'フリーモードでは授業を表示しません', candidate: '認識した授業', addCandidates: '読み込みを確認',
  startTitle: '時間割から始めましょう', startHelp: '時間割の画像を読み込み、確認してから授業に追加します。', startImport: '時間割を読み込む', skipForNow: 'あとで', emptySchedule: 'スケジュールはまだ空です',
  emptyScheduleHelp: '時間割を読み込むか、最初の予定を追加してください。', clearTimetable: '時間割を消去', clearTimetableQuestion: 'すべての授業を消去しますか？', clearTimetableHelp: '授業だけを消去します。予定、タスク、ToDoは残ります。',
  clear: '消去', timetableCleared: '時間割を消去しました', importComplete: '授業を読み込みました', importMerged: '{added}件を追加し、重複する{skipped}件をスキップしました', importNoNew: '新しい授業はありません。既存の重複授業は変更していません。',
  dropUnsupported: '読み取れる画像が見つかりません。画像をコピーして⌘Vを押すか、保存してから選択してください。', imageAccepted: '時間割画像を受け取りました', notImage: '画像ファイルを選択してください',
  pasteButton: '画像を貼り付け', clipboardEmpty: 'クリップボードに画像がありません。先に時間割画像をコピーしてください。', clipboardDenied: 'クリップボードを読み取れません。⌘Vを押すか、ブラウザのクリップボード権限を許可してください。',
  imageReadyTitle: '画像を読み込みました', imageReadyHelp: '認識を開始してください。確認するまで時間割は変更されません。', startRecognition: '認識を開始', recognizing: '時間割を認識中', preparingOcr: '認識エンジンを準備中…',
  firstDownloadHint: '認識モデルはアプリに含まれており、オフラインでも利用できます。', recognitionFailed: '認識できませんでした。より鮮明な画像を選ぶか、手動で追加してください。',
  noStructuredCourses: '文字は認識しましたが、曜日と時刻を含む授業は見つかりませんでした。原文を確認するか、手動で追加してください。', noOcrText: '文字を認識できませんでした。鮮明で全体が写った画像を選んでください。', rawText: '認識した原文', confirmRecognized: '認識した授業を読み込む',
  addManually: '時間割を手動入力', replaceImage: '別の画像を選ぶ'
};

const tr = (key) => {
  const pair = dictionary[key] || [key, key];
  if (state.settings.language === 'en') return pair[1];
  if (state.settings.language === 'ja') return japanese[key] || pair[1];
  if (state.settings.language === 'bilingual') return `${pair[0]} · ${pair[1]}`;
  return pair[0];
};

const uiText = (zh, en, ja) => state.settings.language === 'en' ? en : state.settings.language === 'ja' ? ja : zh;

function localISO(date = new Date()) {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return copy.toISOString().slice(0, 10);
}

function offsetISO(days) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return localISO(d);
}

const defaults = {
  settings: { name: '宇泽', theme: 'system', font: 'medium', language: 'zh', courseMode: true, semester: '2026 秋季学期', semesterStart: '2026-09-07', onboarded: false },
  tasks: [],
  blocks: [],
  todos: [],
  courses: []
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('uniflow-v1'));
    if (saved) {
      const loaded = { ...structuredClone(defaults), ...saved, settings: { ...defaults.settings, ...saved.settings } };
      const needsTaskMigration = (loaded.tasks || []).some(task => !task.createdOn || (task.done && !task.completedOn));
      const needsTodoMigration = (loaded.todos || []).some(todo => !todo.createdOn || (todo.done && !todo.completedOn));
      loaded.tasks = normalizeDailyTasks(loaded.tasks || [], localISO());
      loaded.todos = normalizeHistoryTodos(loaded.todos || [], localISO());
      if (needsTaskMigration || needsTodoMigration) localStorage.setItem('uniflow-v1', JSON.stringify(loaded));
      return loaded;
    }
    const legacy = JSON.parse(localStorage.getItem('uniflow-draft-v1'));
    const fresh = structuredClone(defaults);
    if (legacy?.settings) fresh.settings = { ...fresh.settings, ...legacy.settings, onboarded: false };
    return fresh;
  } catch { return structuredClone(defaults); }
}

let state = loadState();
let currentView = 'today';
let addType = 'block';
let editingCourseId = null;
let editingCourseDate = null;
let editingBlockId = null;
let editingTaskId = null;
let editingTodoId = null;
let pendingDeletion = null;
let tasksExpanded = true;
let importReviewVisible = false;
let pendingImportImageUrl = '';
let pendingImportFile = null;
let recognizedCourses = [];
let rawOcrText = '';
let ocrStatus = 'idle';
let ocrProgress = 0;
let weekOffset = 0;
let historyQuery = '';
let historyType = 'all';
let historyStatus = 'all';

function saveState(showToast = false) {
  localStorage.setItem('uniflow-v1', JSON.stringify(state));
  if (showToast) toast(tr('syncedLocal'));
}

function esc(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function locale() { return state.settings.language === 'en' ? 'en-US' : state.settings.language === 'ja' ? 'ja-JP' : 'zh-CN'; }

function formatDate(date, options) { return new Intl.DateTimeFormat(locale(), options).format(date); }

function greeting() {
  const hour = new Date().getHours();
  let zh = '晚上好', en = 'Good evening', ja = 'こんばんは';
  if (hour >= 5 && hour < 11.5) [zh, en, ja] = ['早上好', 'Good morning', 'おはようございます'];
  else if (hour >= 11.5 && hour < 13.5) [zh, en, ja] = ['中午好', 'Good afternoon', 'こんにちは'];
  else if (hour >= 13.5 && hour < 18.5) [zh, en, ja] = ['下午好', 'Good afternoon', 'こんにちは'];
  if (state.settings.language === 'en') return `${en}, ${esc(state.settings.name)}`;
  if (state.settings.language === 'ja') return `${ja}、${esc(state.settings.name)}さん`;
  if (state.settings.language === 'bilingual') return `${zh}，${esc(state.settings.name)} <span class="greeting-en">${en}</span>`;
  return `${zh}，${esc(state.settings.name)}`;
}

function sameDay(dateString, dayOffset = 0) { return dateString === offsetISO(dayOffset); }

function normalizeWeeks(value = '') {
  const normalized = String(value).trim().replace(/[～~–—至到]/g, '-').replace(/[，、；;\s]+/g, ',').replace(/,+/g, ',').replace(/^,|,$/g, '');
  if (!normalized) return '';
  if (!/^\d{1,2}(?:-\d{1,2})?(?:,\d{1,2}(?:-\d{1,2})?)*$/.test(normalized)) return null;
  return normalized.split(',').every(part => {
    const [first, last = first] = part.split('-').map(Number);
    return first >= 1 && last <= 30 && first <= last;
  }) ? normalized : null;
}

function semesterWeek(date) {
  const start = state.settings.semesterStart;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(start || '')) return null;
  const startDay = new Date(`${start}T12:00:00`);
  if (Number.isNaN(startDay.getTime())) return null;
  const startUtc = Date.UTC(startDay.getFullYear(), startDay.getMonth(), startDay.getDate());
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((dateUtc - startUtc) / (7 * DAY)) + 1;
}

function courseOccursOn(course, date) {
  if (course.weekday !== date.getDay()) return false;
  if (isCourseOccurrenceExcluded(course, localISO(date))) return false;
  if (!course.weeks) return true;
  const week = semesterWeek(date);
  if (week === null || week < 1) return false;
  return course.weeks.split(',').some(part => {
    const [first, last = first] = part.split('-').map(Number);
    return week >= first && week <= last;
  });
}

function currentCourses() {
  if (!state.settings.courseMode) return [];
  const now = new Date();
  return state.courses.filter(course => courseOccursOn(course, now)).sort((a, b) => a.start.localeCompare(b.start));
}

function renderToday() {
  const now = new Date();
  const courses = currentCourses();
  const timedBlocks = state.blocks.filter(b => sameDay(b.date) && b.time).sort((a, b) => a.time.localeCompare(b.time));
  const untimed = state.blocks.filter(b => sameDay(b.date) && !b.time);
  const scheduleTodos = state.todos.filter(t => sameDay(t.date) && t.schedule && !t.done).map(t => ({ ...t, start: t.time || '18:00', end: '', place: '', color: '#ef8d38', isTodo: true }));
  const events = [...courses, ...timedBlocks.map(b => ({ ...b, start: b.time, place: b.place || '' })), ...scheduleTodos].sort((a,b) => a.start.localeCompare(b.start));
  const conflicts = [];
  events.forEach((event, index) => events.slice(index + 1).forEach(other => {
    if (event.end && other.end && event.start < other.end && other.start < event.end) conflicts.push([event, other]);
  }));
  const dailyTasks = dailyTasksForDate(state.tasks, localISO());
  const doneCount = dailyTasks.filter(task => task.done).length;
  const completelyEmpty = !state.courses.length && !state.blocks.length && !state.tasks.length && !state.todos.length;

  if (!state.settings.onboarded && completelyEmpty) {
    return `<div class="content-wrap">
      <div class="page-heading"><div><p class="eyebrow">${tr('today')}</p><h1>${greeting()}</h1><p class="date-line">${formatDate(now, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div></div>
      <section class="welcome-empty">
        <span class="welcome-icon">▦</span>
        <h2>${tr('startTitle')}</h2>
        <p>${tr('startHelp')}</p>
        <div class="welcome-actions"><button class="primary-button" id="startImport">${tr('startImport')}</button><button class="text-button" id="skipSetup">${tr('skipForNow')}</button></div>
        <div class="welcome-steps"><span><b>1</b>${tr('chooseImage')}</span><i></i><span><b>2</b>${tr('review')}</span><i></i><span><b>3</b>${tr('save')}</span></div>
      </section>
    </div>`;
  }

  return `
    <div class="content-wrap">
      <div class="page-heading">
        <div><p class="eyebrow">${tr('today')}</p><h1>${greeting()}</h1><p class="date-line">${formatDate(now, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
        <div class="day-status"><span class="status-dot"></span>${state.settings.courseMode ? tr('courseModeOn') : tr('freeMode')}</div>
      </div>
      <div class="today-layout">
        <section>
          <div class="section-label"><h2>${tr('todaySchedule')}</h2><span>${events.length} ${uiText('项', 'items', '件')}</span></div>
          <div class="timeline">
            ${events.length ? events.map(event => {
              const editAttribute = event.isTodo ? `data-edit-todo="${esc(event.id)}"` : event.weekday !== undefined ? `data-edit-course="${esc(event.id)}"` : `data-edit-block="${esc(event.id)}"`;
              return `
              <div class="time-row">
                <div class="time-label">${esc(event.start)}</div>
                <button type="button" ${editAttribute} class="event editable-event" style="--event-color:${event.color || '#5e76cb'}">
                  <span class="event-stripe"></span>
                  <div class="event-body"><p class="event-title">${esc(event.title)}</p><div class="event-meta"><span>${esc(event.start)}${event.end ? `–${esc(event.end)}` : ''}</span>${event.place ? `<span>·</span><span>${esc(event.place)}</span>` : ''}</div></div>
                  <span class="event-tag">${event.isTodo ? tr('todo') : event.weekday !== undefined ? tr('courses') : tr('plan')}</span>
                </button>
              </div>`;
            }).join('') : `<div class="empty-state"><strong>${state.settings.courseMode ? tr('noPlans') : tr('noCourse')}</strong></div>`}
          </div>
          <div class="other-plans">
            <div class="section-label"><h2>${tr('otherPlans')}</h2><span>${untimed.length}</span></div>
            <div class="plan-list">${untimed.length ? untimed.map(plan => `<button type="button" class="plan-row" data-edit-block="${esc(plan.id)}"><span class="plan-bullet"></span><span><strong>${esc(plan.title)}</strong>${plan.place ? `<small>${esc(plan.place)}</small>` : ''}</span></button>`).join('') : `<div class="empty-state"><span>${tr('noPlans')}</span></div>`}</div>
          </div>
        </section>
        <aside class="side-panel">
          <section class="quiet-panel">
            <div class="panel-head"><button id="toggleTasks" aria-expanded="${tasksExpanded}"><span class="panel-title">${tasksExpanded ? '⌄' : '›'} ${tr('todayTasks')}</span></button><span class="task-panel-actions"><button type="button" class="task-history-button" id="openTaskHistory" title="${esc(tr('openHistory'))}" aria-label="${esc(tr('openHistory'))}">⌕</button><span class="progress-copy">${doneCount} / ${dailyTasks.length}</span></span></div>
            <div class="progress-line"><span style="width:${dailyTasks.length ? doneCount / dailyTasks.length * 100 : 0}%"></span></div>
            ${tasksExpanded ? `<div class="task-list">${dailyTasks.map(task => {
              const carryLabelDate = taskCarryLabelDate(task, localISO());
              const carriedDate = carryLabelDate ? formatDate(new Date(`${carryLabelDate}T12:00:00`), { month: 'short', day: 'numeric' }) : '';
              return `<div class="task-row ${task.done ? 'done' : ''}" data-task="${task.id}"><button class="check" aria-label="${task.done ? 'Undo' : 'Complete'}">✓</button><button type="button" class="task-open" data-edit-task="${esc(task.id)}"><span class="task-text">${esc(task.title)}</span></button>${carryLabelDate ? `<small class="task-carry">${esc(tr('carriedTask').replaceAll('{date}', carriedDate))}</small>` : ''}</div>`;
            }).join('')}</div><button class="inline-add" data-add="task">＋ ${tr('addTask')}</button>` : ''}
          </section>
          ${conflicts.length ? `<details class="quiet-panel conflict">
            <summary>${tr('conflict')} · ${conflicts.length}</summary>
            ${conflicts.map(pair => `<div class="conflict-body">${pair.map(item => `<div><strong>${esc(item.title)}</strong><br>${esc(item.start)}–${esc(item.end)}</div>`).join('')}</div>`).join('')}
          </details>` : ''}
        </aside>
      </div>
    </div>`;
}

function startOfWeek() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setHours(12,0,0,0);
  monday.setDate(now.getDate() - day + 1 + weekOffset * 7);
  return monday;
}

function renderWeek() {
  const monday = startOfWeek();
  const days = Array.from({ length: 7 }, (_, i) => new Date(monday.getTime() + DAY * i));
  const weekdayLabel = state.settings.language === 'en' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : state.settings.language === 'ja' ? ['月','火','水','木','金','土','日'] : ['周一','周二','周三','周四','周五','周六','周日'];
  const eventsByDay = days.map(day => {
    const courseEvents = state.settings.courseMode ? state.courses.filter(course => courseOccursOn(course, day)).map(course => ({ ...course, isCourse: true })) : [];
    const blocks = state.blocks.filter(block => block.date === localISO(day) && block.time).map(block => ({ ...block, start: block.time, place: block.place || '' }));
    const todos = state.todos.filter(todo => todo.date === localISO(day) && todo.time && todo.schedule && !todo.done).map(todo => ({ ...todo, start: todo.time, place: '', color: '#ef8d38', isTodo: true }));
    return [...courseEvents, ...blocks, ...todos].sort((a, b) => a.start.localeCompare(b.start));
  });
  const currentWeek = semesterWeek(monday);
  return `<div class="content-wrap week-view">
    <div class="page-heading"><div><p class="eyebrow">${tr('week')}</p><h1>${tr('thisWeek')}</h1><p class="date-line">${tr('scheduleHint')}</p></div></div>
    <div class="week-toolbar"><div class="week-nav"><button id="previousWeek" aria-label="Previous">‹</button><strong>${formatDate(monday,{month:'short',day:'numeric'})} – ${formatDate(days[6],{month:'short',day:'numeric'})}</strong><button id="nextWeek" aria-label="Next">›</button></div><span class="mode-pill">${currentWeek && currentWeek > 0 ? tr('weekNumber').replace('{n}', currentWeek) : (state.settings.courseMode ? tr('courseModeOn') : tr('freeMode'))}</span></div>
    <div class="week-board"><div class="week-grid">
      <div class="week-corner" style="grid-column:1;grid-row:1"></div>${days.map((day,i)=>`<div class="week-day ${localISO(day)===localISO()?'current':''}" style="grid-column:${i+2};grid-row:1">${weekdayLabel[i]}<strong>${day.getDate()}</strong></div>`).join('')}
      ${periods.map((period,index) => `<div class="week-time" style="grid-column:1;grid-row:${index+2}"><b>${period.number}</b><span>${period.start}<br>${period.end}</span></div>${days.map((_,dayIndex) => `<div class="week-cell" style="grid-column:${dayIndex+2};grid-row:${index+2}"></div>`).join('')}`).join('')}
      ${eventsByDay.flatMap((events,dayIndex) => events.map(event => {
        const position = periodSpan(event.start, event.end);
        const range = `${event.start}${event.end ? `–${event.end}` : ''}`;
        const details = `${range}${event.place ? ` · ${event.place}` : ''}`;
        const editAttribute = event.isCourse ? `data-edit-course="${esc(event.id)}" data-edit-course-date="${localISO(days[dayIndex])}"` : event.isTodo ? `data-edit-todo="${esc(event.id)}"` : `data-edit-block="${esc(event.id)}"`;
        return `<button type="button" ${editAttribute} aria-label="${esc(`${event.title} ${details}`)}" class="week-event editable-week-event" style="grid-column:${dayIndex+2};grid-row:${position.first+1} / span ${position.span};--event-color:${event.color || '#5779c8'}"><strong>${esc(event.title)}</strong><span class="week-event-range">${esc(range)}</span>${event.place ? `<span class="week-event-place">${esc(event.place)}</span>` : ''}</button>`;
      })).join('')}
    </div></div>
  </div>`;
}

function todoDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || '')) return null;
  const date = new Date(`${dateString}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function todoDeadlineLabel(todo) {
  const date = todoDate(todo.date);
  if (!date) return tr('noDeadline');
  const exact = formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
  return `${exact} · ${todo.time || tr('allDay')}`;
}

function renderTodo() {
  const visibleTodos = visibleTodosForDate(state.todos, localISO());
  const groupDate = todo => todo.done && todo.completedOn ? todo.completedOn : todo.date;
  const groups = [
    { key: 'today', label: tr('todayGroup'), matches: todo => sameDay(groupDate(todo)) },
    { key: 'tomorrow', label: tr('tomorrow'), matches: todo => sameDay(groupDate(todo), 1) },
    { key: 'later', label: tr('later'), matches: todo => todoDate(groupDate(todo)) && !sameDay(groupDate(todo)) && !sameDay(groupDate(todo), 1) }
  ];
  if (visibleTodos.some(todo => !todoDate(groupDate(todo)))) groups.push({ key: 'none', label: tr('noDeadline'), matches: todo => !todoDate(groupDate(todo)) });
  const open = state.todos.filter(t=>!t.done).length;
  const done = state.todos.filter(t=>t.done).length;
  return `<div class="content-wrap narrow">
    <div class="page-heading"><div><p class="eyebrow">${tr('todo')}</p><h1>${tr('deadlines')}</h1><p class="date-line">${tr('deadlinesHint')}</p></div><div class="todo-heading-actions"><div class="todo-stats"><span><strong>${open}</strong>${tr('open')}</span><span><strong>${done}</strong>${tr('completed')}</span></div><button class="filter-button" id="openHistory">⌕ ${tr('openHistory')}</button></div></div>
    <div class="todo-groups">${groups.map(group => {
      const items = visibleTodos.filter(group.matches).sort((a,b)=>`${groupDate(a) || '9999'}T${a.time || '99:99'}`.localeCompare(`${groupDate(b) || '9999'}T${b.time || '99:99'}`));
      const dropDate = group.key === 'today' ? offsetISO(0) : group.key === 'tomorrow' ? offsetISO(1) : '';
      return `<section class="todo-group" data-group="${esc(group.key)}" data-date="${dropDate}"><div class="group-title"><h2>${esc(group.label)}</h2><span>${items.length}</span></div>${items.length ? items.map(item=>`<div class="todo-row ${item.done?'done':''}" draggable="true" data-todo="${esc(item.id)}"><button type="button" class="check" aria-label="${item.done ? 'Undo' : 'Complete'}">✓</button><button type="button" class="todo-open" data-edit-todo="${esc(item.id)}"><span class="todo-main"><strong>${esc(item.title)}</strong>${item.schedule?`<span><b class="schedule-eye">◉</b>${tr('scheduleShown')}</span>`:''}</span><span class="todo-deadline">${esc(todoDeadlineLabel(item))}</span></button></div>`).join('') : `<div class="empty-state">—</div>`}</section>`;
    }).join('')}</div>
  </div>`;
}

function historyDateLabel(dateString) {
  const date = todoDate(dateString);
  return date ? formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
}

function currentHistoryResults() {
  const entries = buildHistoryEntries({ todos: state.todos, tasks: state.tasks });
  return filterHistoryEntries(entries, { query: historyQuery, type: historyType, status: historyStatus });
}

function historyResultsMarkup(entries) {
  if (!entries.length) return `<div class="history-empty"><span>⌕</span><p>${tr('noHistory')}</p></div>`;
  return `<div class="history-list">${entries.map(entry => {
    const meta = [];
    if (entry.kind === 'todo' && entry.dueDate) meta.push(`${tr('dueOn')} ${historyDateLabel(entry.dueDate)}${entry.dueTime ? ` · ${entry.dueTime}` : ''}`);
    if (entry.createdOn) meta.push(`${tr('createdOn')} ${historyDateLabel(entry.createdOn)}`);
    if (entry.done && entry.completedOn) meta.push(`${tr('completedOn')} ${historyDateLabel(entry.completedOn)}`);
    const content = `<span class="history-kind ${entry.kind}">${tr(entry.kind === 'todo' ? 'todo' : 'task')}</span><span class="history-main"><strong>${esc(entry.title)}</strong><small>${esc(meta.join(' · '))}</small></span><span class="history-status ${entry.done ? 'done' : 'open'}">${tr(entry.done ? 'doneStatus' : 'openStatus')}</span>`;
    return entry.kind === 'todo'
      ? `<button type="button" class="history-row" data-edit-todo="${esc(entry.id)}">${content}</button>`
      : `<button type="button" class="history-row" data-edit-task="${esc(entry.id)}">${content}</button>`;
  }).join('')}</div>`;
}

function renderHistory() {
  const results = currentHistoryResults();
  const filterButton = (value, current, label, attribute) => `<button type="button" class="${value === current ? 'active' : ''}" ${attribute}="${value}">${label}</button>`;
  return `<div class="content-wrap narrow history-view">
    <div class="page-heading"><div><p class="eyebrow">${tr('history')}</p><h1>${tr('historyTitle')}</h1><p class="date-line">${tr('historyHint')}</p></div><button class="filter-button" id="backToTodos">‹ ${tr('backToTodos')}</button></div>
    <section class="history-tools">
      <label class="history-search"><span>⌕</span><input id="historySearch" type="search" value="${esc(historyQuery)}" placeholder="${esc(tr('searchHistory'))}" autocomplete="off" /></label>
      <div class="history-filter-row"><div class="segmented history-filter">${filterButton('all', historyType, tr('allTypes'), 'data-history-type')}${filterButton('todo', historyType, tr('todosOnly'), 'data-history-type')}${filterButton('task', historyType, tr('tasksOnly'), 'data-history-type')}</div><div class="segmented history-filter">${filterButton('all', historyStatus, tr('allStatuses'), 'data-history-status')}${filterButton('open', historyStatus, tr('openStatus'), 'data-history-status')}${filterButton('done', historyStatus, tr('doneStatus'), 'data-history-status')}</div></div>
    </section>
    <div class="history-summary" id="historyCount">${tr('historyResults').replaceAll('{n}', results.length)}</div>
    <div id="historyResults">${historyResultsMarkup(results)}</div>
  </div>`;
}

function renderCourses() {
  const dayNames = state.settings.language === 'en' ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] : state.settings.language === 'ja' ? ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'] : ['周日','周一','周二','周三','周四','周五','周六'];
  const courses = [...state.courses].sort((a,b)=>a.weekday-b.weekday||a.start.localeCompare(b.start));
  return `<div class="content-wrap narrow"><div class="page-heading"><div><p class="eyebrow">${tr('courses')}</p><h1>${tr('courseList')}</h1><p class="date-line">${tr('courseHint')}</p></div><span class="mode-pill">${esc(state.settings.semester)}</span></div>
    <div class="list-toolbar"><div class="toolbar-actions"><button class="filter-button" data-add="course">＋ ${tr('addCourse')}</button><button class="filter-button" id="importFromCourses">⇧ ${tr('startImport')}</button></div>${courses.length ? `<button class="danger-button" id="clearCourses">${tr('clearTimetable')}</button>` : ''}</div>
    <div class="course-list">${courses.length ? courses.map(course=>`<article class="course-row"><span class="course-color" style="--course-color:${course.color}"></span><div class="course-main"><strong>${esc(course.title)}</strong>${course.place || course.teacher ? `<span>${[course.place, course.teacher].filter(Boolean).map(esc).join(' · ')}</span>` : ''}${course.weeks ? `<span>${esc(course.weeks)} ${uiText('周', 'weeks', '週')}</span>` : ''}</div><div class="course-time"><strong>${dayNames[course.weekday]}</strong><span>${course.start}–${course.end}</span><button type="button" class="course-edit" data-edit-course="${esc(course.id)}">${tr('edit')}</button></div></article>`).join('') : `<div class="course-empty"><span class="welcome-icon">▦</span><strong>${tr('emptySchedule')}</strong><p>${tr('emptyScheduleHelp')}</p></div>`}</div></div>`;
}

function weekdayFromText(text) {
  const patterns = [
    [0, /(周日|周天|星期日|星期天|Sunday|\bSun\b)/i], [1, /(周一|星期一|Monday|\bMon\b)/i],
    [2, /(周二|星期二|Tuesday|\bTue\b)/i], [3, /(周三|星期三|Wednesday|\bWed\b)/i],
    [4, /(周四|星期四|Thursday|\bThu\b)/i], [5, /(周五|星期五|Friday|\bFri\b)/i],
    [6, /(周六|星期六|Saturday|\bSat\b)/i]
  ];
  return patterns.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

function timeRangeFromText(text) {
  const match = text.match(/(?:^|\s)([01]?\d|2[0-3])\s*[:：.]\s*([0-5]\d)\s*(?:-|–|—|~|～|至|到)\s*([01]?\d|2[0-3])\s*[:：.]\s*([0-5]\d)(?:\s|$)/);
  if (!match) return null;
  return [`${match[1].padStart(2, '0')}:${match[2]}`, `${match[3].padStart(2, '0')}:${match[4]}`];
}

function schedulesFromLine(line) {
  const explicit = timeRangeFromText(` ${line} `);
  const explicitDay = weekdayFromText(line);
  if (explicit && explicitDay !== null) return [{ weekday: explicitDay, start: explicit[0], end: explicit[1] }];
  const dayNumber = { '日': 0, '天': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
  const schedules = [];
  const pattern = /星期([一二三四五六日天])[^星期\n]{0,70}?(\d{1,2})\s*[~～\-—至到]\s*(\d{1,2})\s*节/g;
  let match;
  while ((match = pattern.exec(line))) {
    const first = Number(match[2]);
    const last = Number(match[3]);
    if (!periodTimes[first] || !periodTimes[last]) continue;
    schedules.push({ weekday: dayNumber[match[1]], start: periodTimes[first][0], end: periodTimes[last][1] });
  }
  return schedules;
}

function courseTitleFromContext(lines, index, place) {
  const line = lines[index];
  const metadata = /(周[一二三四五六日天]|星期[一二三四五六日天]|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b)/gi;
  const time = /(?:[01]?\d|2[0-3])\s*[:：.]\s*[0-5]\d\s*(?:-|–|—|~|～|至|到)\s*(?:[01]?\d|2[0-3])\s*[:：.]\s*[0-5]\d/g;
  const clean = value => {
    let cleaned = value.replace(metadata, ' ').replace(time, ' ').replace(/(?:上课地点|地点|教室|room|location)\s*[:：]?/gi, ' ')
      .replace(/\b[A-Z]{2,}[A-Z0-9]*\d{4,}\.?\d{0,2}\b/gi, ' ').replace(/\d+(?:[~～\-,，、]\d+)*周/gi, ' ').replace(/\d{1,2}\s*[~～\-—至到]\s*\d{1,2}\s*节/gi, ' ');
    if (place) cleaned = cleaned.replace(place, ' ');
    return cleaned.replace(/[|｜]+/g, ' ').replace(/\s+/g, ' ').trim();
  };
  const fromLine = clean(line);
  if (fromLine.length >= 2 && !/^\d+$/.test(fromLine) && !/^(?:[\u4e00-\u9fff]{2,4}[;；]?\s*)+$/.test(fromLine)) return fromLine.slice(0, 60);
  for (let cursor = index - 1; cursor >= Math.max(0, index - 5); cursor -= 1) {
    const source = lines[cursor];
    if (/^(?:选课|查询|重置|仅查询|星期[一二三四五六日天])$/.test(source)) continue;
    if (/^[A-Z]{2,}[A-Z0-9]*\d{4,}\.?\d{0,2}$/i.test(source)) continue;
    if (schedulesFromLine(source).length) continue;
    const candidate = clean(source);
    if (candidate.length >= 2 && /[A-Za-z\u4e00-\u9fff]/.test(candidate)) return candidate.slice(0, 60);
  }
  return '';
}

function parseTimetableText(text) {
  const lines = text.split(/\r?\n/).map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const colors = ['#337ccf', '#7289da', '#3c9a78', '#d98745', '#8d6bc4', '#cc6677'];
  const parsed = [];
  lines.forEach((line, index) => {
    const schedules = schedulesFromLine(line);
    if (!schedules.length) return;
    const context = [line, lines[index + 1] || '', lines[index + 2] || ''].join(' ');
    const place = locationFromText(context);
    const title = courseTitleFromContext(lines, index, place);
    if (!title) return;
    schedules.forEach(schedule => {
      const key = `${title}|${schedule.weekday}|${schedule.start}`.toLowerCase();
      if (parsed.some(course => course.key === key)) return;
      parsed.push({ key, title, weekday: schedule.weekday, start: schedule.start, end: schedule.end, place, weeks: '', color: colors[parsed.length % colors.length] });
    });
  });
  return parsed;
}

function ocrWordsFromBlocks(blocks = []) {
  return blocks.flatMap(block => block.paragraphs || []).flatMap(paragraph => paragraph.lines || []).flatMap(line => line.words || [])
    .filter(word => word?.text && word?.bbox);
}

function clusterWordLines(words) {
  const lines = [];
  [...words].sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0).forEach(word => {
    const middle = (word.bbox.y0 + word.bbox.y1) / 2;
    let line = lines.find(candidate => Math.abs(candidate.middle - middle) < 10);
    if (!line) {
      line = { middle, words: [] };
      lines.push(line);
    }
    line.words.push(word);
    line.middle = line.words.reduce((sum, item) => sum + (item.bbox.y0 + item.bbox.y1) / 2, 0) / line.words.length;
  });
  return lines.map(line => ({ ...line, words: line.words.sort((a, b) => a.bbox.x0 - b.bbox.x0) })).sort((a, b) => a.middle - b.middle);
}

function weeksFromText(text) {
  const candidate = String(text || '').match(/(\d{1,2}(?:\s*[-~～—至到]\s*\d{1,2})?(?:\s*[,，、]\s*\d{1,2}(?:\s*[-~～—至到]\s*\d{1,2})?)*)\s*周/)?.[1] || '';
  return normalizeWeeks(candidate) || '';
}

function weeksFromDetailLines(lines, weekday, first, last) {
  const dayNames = ['[日天]', '一', '二', '三', '四', '五', '六'];
  const periodPattern = new RegExp(`${first}\\s*[-~～—至到]+\\s*${last}\\s*节`);
  const dayPattern = new RegExp(`星期\\s*${dayNames[weekday]}`);
  const matching = lines.find(line => dayPattern.test(line) && periodPattern.test(line))
    || lines.find(line => dayPattern.test(line))
    || lines.find(line => periodPattern.test(line));
  return weeksFromText(matching) || lines.map(weeksFromText).find(Boolean) || '';
}

function parseTimetableBlocks(blocks, imageWidth) {
  const words = ocrWordsFromBlocks(blocks);
  const courseCode = /^[A-Z]{2,}[A-Z0-9]*\d{4,}[A-Z]*\.?\d{0,2}$/i;
  const codes = words.filter(word => courseCode.test(word.text.replace(/\s/g, '')));
  if (codes.length < 2 || !imageWidth) return [];
  const tableLeft = imageWidth * 0.045;
  const tableRight = imageWidth * 0.012;
  const columnWidth = (imageWidth - tableLeft - tableRight) / 7;
  const colors = ['#337ccf', '#7289da', '#3c9a78', '#d98745', '#8d6bc4', '#cc6677'];
  const parsed = [];

  codes.forEach(code => {
    const centerX = (code.bbox.x0 + code.bbox.x1) / 2;
    const columnIndex = Math.max(0, Math.min(6, Math.floor((centerX - tableLeft) / columnWidth)));
    const weekday = columnIndex === 6 ? 0 : columnIndex + 1;
    const x0 = tableLeft + columnIndex * columnWidth + 3;
    const x1 = tableLeft + (columnIndex + 1) * columnWidth - 3;
    const inColumn = word => {
      const wordCenter = (word.bbox.x0 + word.bbox.x1) / 2;
      return wordCenter >= x0 && wordCenter < x1;
    };
    const titleLines = clusterWordLines(words.filter(word => inColumn(word) && word.bbox.y1 <= code.bbox.y0 + 3 && word.bbox.y0 >= code.bbox.y0 - 90));
    const titleLine = [...titleLines].reverse().find(line => {
      const text = line.words.map(word => word.text).join('').replace(/[|｜“”]/g, '').trim();
      return text.length >= 2 && !/^(?:选课|星期[一二三四五六日天])+$/.test(text) && !courseCode.test(text);
    });
    const title = titleLine ? titleLine.words.map(word => word.text).join('').replace(/[|｜“”]+/g, '').trim().slice(0, 60) : '';
    if (!title) return;

    const nextCode = codes.filter(other => other !== code && inColumn(other) && other.bbox.y0 > code.bbox.y0).sort((a, b) => a.bbox.y0 - b.bbox.y0)[0];
    const lowerBound = Math.min(code.bbox.y0 + 190, nextCode ? nextCode.bbox.y0 - 4 : Infinity);
    const detailWords = words.filter(word => inColumn(word) && word.bbox.y0 >= code.bbox.y0 && word.bbox.y0 <= lowerBound).sort((a, b) => a.bbox.y0 - b.bbox.y0 || a.bbox.x0 - b.bbox.x0);
    const detailLines = clusterWordLines(detailWords).map(line => line.words.map(word => word.text).join(' '));
    const detailText = detailWords.map(word => word.text).join(' ');
    const compactDetail = detailText.replace(/\s*([~～—至到-])\s*/g, '$1').replace(/\s+/g, ' ');
    const dayCharacters = { 0: ['日', '天'], 1: ['一'], 2: ['二'], 3: ['三'], 4: ['四'], 5: ['五'], 6: ['六'] };
    const ranges = [];
    const rangePattern = /(\d{1,2})\s*[-~～—至到]+\s*(\d{1,2})/g;
    let rangeMatch;
    while ((rangeMatch = rangePattern.exec(compactDetail))) {
      const first = Number(rangeMatch[1]);
      const last = Number(rangeMatch[2]);
      if (!periodTimes[first] || !periodTimes[last]) continue;
      const context = compactDetail.slice(Math.max(0, rangeMatch.index - 16), rangeMatch.index);
      const mentionedDay = [...context].reverse().find(character => /[一二三四五六日天]/.test(character)) || '';
      ranges.push({ first, last, mentionedDay });
    }
    const range = ranges.find(candidate => dayCharacters[weekday].includes(candidate.mentionedDay)) || ranges[0];
    if (!range) return;
    const first = range.first;
    const last = range.last;
    if (!periodTimes[first] || !periodTimes[last]) return;
    const place = locationFromText(detailText);
    let weeks = weeksFromDetailLines(detailLines, weekday, first, last);
    if (!weeks) {
      const periodWord = detailWords.find(word => new RegExp(`^${first}\\s*[-~～—至到]+\\s*${last}$`).test(word.text));
      if (periodWord) {
        const nearWeekWords = detailWords.filter(word => word.bbox.x0 < periodWord.bbox.x0
          && Math.abs((word.bbox.y0 + word.bbox.y1) - (periodWord.bbox.y0 + periodWord.bbox.y1)) < 48
          && normalizeWeeks(word.text));
        const closest = nearWeekWords.sort((a, b) => b.bbox.x0 - a.bbox.x0)[0];
        weeks = closest ? normalizeWeeks(closest.text) : '';
      }
    }
    const key = `${title}|${weekday}|${periodTimes[first][0]}`.toLowerCase();
    if (parsed.some(course => course.key === key)) return;
    parsed.push({ key, title, weekday, start: periodTimes[first][0], end: periodTimes[last][1], place, weeks,
      ocrBox: { left: Math.max(0, code.bbox.x0 - 6), top: code.bbox.y1 + 10, width: Math.round(columnWidth - 8), height: Math.max(60, Math.min(150, nextCode ? nextCode.bbox.y0 - code.bbox.y1 - 16 : 150)) },
      color: colors[parsed.length % colors.length] });
  });
  return parsed;
}

function importDayOptions(selected) {
  const names = state.settings.language === 'en' ? ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] : state.settings.language === 'ja' ? ['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'] : ['周日','周一','周二','周三','周四','周五','周六'];
  return names.map((name, value) => `<option value="${value}" ${value === selected ? 'selected' : ''}>${name}</option>`).join('');
}

function renderRecognizedCourses() {
  if (!recognizedCourses.length) {
    const message = rawOcrText ? tr('noStructuredCourses') : tr('noOcrText');
    return `<div class="ocr-empty"><span>⌁</span><p>${message}</p></div>${rawOcrText ? `<details class="raw-ocr"><summary>${tr('rawText')}</summary><pre>${esc(rawOcrText)}</pre></details>` : ''}<button class="secondary-button manual-import-button" type="button">＋ ${tr('addManually')}</button>`;
  }
  return `<div class="ocr-results-head"><h3>${tr('candidate')}</h3><span>${recognizedCourses.length}</span></div>
    <div class="ocr-candidates">${recognizedCourses.map((course, index) => `<article class="ocr-candidate" data-ocr-course>
      <div class="ocr-candidate-head"><span>${String(index + 1).padStart(2, '0')}</span><button type="button" class="remove-ocr-course" aria-label="${tr('clear')}">×</button></div>
      <label class="ocr-field ocr-title"><span>${tr('course')}</span><input data-ocr-field="title" value="${esc(course.title)}" /></label>
      <div class="ocr-field-grid">
        <label class="ocr-field"><span>${tr('weekday')}</span><select data-ocr-field="weekday">${importDayOptions(course.weekday)}</select></label>
        <label class="ocr-field"><span>${tr('locationOptional')}</span><input data-ocr-field="place" value="${esc(course.place)}" /></label>
        <label class="ocr-field"><span>${tr('startTime')}</span><input data-ocr-field="start" type="time" value="${course.start}" /></label>
        <label class="ocr-field"><span>${tr('endTime')}</span><input data-ocr-field="end" type="time" value="${course.end}" /></label>
        <label class="ocr-field ocr-weeks"><span>${tr('weeksOptional')}</span><input data-ocr-field="weeks" value="${esc(course.weeks || '')}" placeholder="1-5,7-16" /></label>
      </div>
      ${course.weeks ? '' : `<p class="ocr-candidate-warning">${tr('weeksNotFound')}</p>`}
    </article>`).join('')}</div>
    <button class="primary-button" id="confirmImport">${tr('confirmRecognized')} · ${recognizedCourses.length}</button>
    <button class="text-button manual-import-button" type="button">＋ ${tr('addManually')}</button>
    <details class="raw-ocr"><summary>${tr('rawText')}</summary><pre>${esc(rawOcrText)}</pre></details>`;
}

function renderImport(review = false) {
  let reviewPanel = `<div class="process-list"><h3>${tr('reviewFlow')}</h3>${[['1',tr('readImage'),tr('readImageHelp')],['2',tr('recognize'),tr('recognizeHelp')],['3',tr('review'),tr('reviewHelp')]].map(step=>`<div class="process-step"><span class="step-number">${step[0]}</span><div><strong>${step[1]}</strong><p>${step[2]}</p></div></div>`).join('')}<button class="secondary-button manual-import-button" type="button">＋ ${tr('addManually')}</button><div class="privacy-line"><span>⌁</span><span>${tr('privateImport')}</span></div></div>`;
  if (review) {
    const statusPanel = ocrStatus === 'ready' ? `<h3>${tr('imageReadyTitle')}</h3><p class="ocr-copy">${tr('imageReadyHelp')}</p><button class="primary-button" id="startOcr">${tr('startRecognition')}</button><button class="secondary-button manual-import-button" type="button">＋ ${tr('addManually')}</button><button class="text-button" id="replaceImage" type="button">${tr('replaceImage')}</button><p class="ocr-note">${tr('firstDownloadHint')}</p>`
      : ocrStatus === 'recognizing' ? `<div class="ocr-loading"><span class="ocr-spinner"></span><h3>${tr('recognizing')}</h3><p id="ocrProgressLabel">${ocrProgress ? `${ocrProgress}%` : tr('preparingOcr')}</p><div class="ocr-progress"><i id="ocrProgressBar" style="width:${ocrProgress}%"></i></div></div>`
      : ocrStatus === 'failed' ? `<div class="ocr-empty"><span>!</span><p>${tr('recognitionFailed')}</p></div><button class="primary-button" id="startOcr">${tr('startRecognition')}</button><button class="secondary-button manual-import-button" type="button">＋ ${tr('addManually')}</button><button class="text-button" id="replaceImage" type="button">${tr('replaceImage')}</button>`
      : renderRecognizedCourses();
    reviewPanel = `<div class="process-list ocr-review"><img class="import-preview-image" src="${pendingImportImageUrl}" alt="${esc(tr('imageReadyTitle'))}" />${statusPanel}<div class="privacy-line"><span>⌁</span><span>${tr('privateImport')}</span></div></div>`;
  }
  return `<div class="content-wrap"><div class="page-heading"><div><p class="eyebrow">${tr('import')}</p><h1>${tr('importTitle')}</h1><p class="date-line">${tr('importHint')}</p></div></div><div class="import-panel">
    <div class="drop-zone" id="dropZone" tabindex="0"><div><span class="drop-icon">⇧</span><h3>${tr('dropCopy')}</h3><p class="drop-source-hint">${tr('pasteImage')}</p><p>PNG · JPEG · HEIC<br>${uiText('清晰、完整的截图识别效果更好','A clear screenshot works best','鮮明で全体が写った画像がおすすめです')}</p><div class="import-actions"><label class="file-button" for="fileInput">${tr('chooseImage')}</label><button type="button" class="file-button paste-button" id="pasteImageButton">⌘V&nbsp; ${tr('pasteButton')}</button></div><input class="visually-hidden-file" type="file" id="fileInput" accept="image/png,image/jpeg,image/heic,image/heif,image/webp" /></div></div>
    ${reviewPanel}
  </div></div>`;
}

function render() {
  const views = { today: renderToday, week: renderWeek, todo: renderTodo, history: renderHistory, courses: renderCourses, import: () => renderImport(importReviewVisible) };
  $('#viewRoot').innerHTML = views[currentView]();
  $('.topbar-title').textContent = tr(currentView);
  $$('.nav-item[data-view], .bottom-item[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === currentView || (currentView === 'history' && button.dataset.view === 'todo')));
  $('#todoBadge').textContent = state.todos.filter(t=>!t.done).length;
  bindViewEvents();
  if (currentView === 'week') {
    const board = $('.week-board');
    const first = $$('.week-event').sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
    if (board && first) board.scrollTop = Math.max(0, first.getBoundingClientRect().top - board.getBoundingClientRect().top - 82);
  }
}

function isReadableImage(file) {
  return Boolean(file && (file.type?.startsWith('image/') || /\.(png|jpe?g|heic|heif|webp)$/i.test(file.name || '')));
}

function acceptTimetableImage(file) {
  if (!isReadableImage(file)) {
    toast(tr('notImage'));
    return false;
  }
  if (pendingImportImageUrl) URL.revokeObjectURL(pendingImportImageUrl);
  pendingImportFile = file;
  pendingImportImageUrl = URL.createObjectURL(file);
  recognizedCourses = [];
  rawOcrText = '';
  ocrStatus = 'ready';
  ocrProgress = 0;
  importReviewVisible = true;
  render();
  toast(tr('imageAccepted'));
  return true;
}

async function runOcr() {
  if (!pendingImportFile || !window.Tesseract) {
    ocrStatus = 'failed';
    render();
    return;
  }
  ocrStatus = 'recognizing';
  ocrProgress = 0;
  render();
  let worker;
  try {
    const ocrBase = new URL('./vendor/', document.baseURI);
    worker = await window.Tesseract.createWorker(['chi_sim', 'eng'], 1, {
      workerPath: new URL('tesseract/worker.min.js', ocrBase).href,
      corePath: new URL('tesseract-core', ocrBase).href,
      langPath: new URL('tessdata', ocrBase).href,
      logger(message) {
        if (message.status !== 'recognizing text' || typeof message.progress !== 'number') return;
        ocrProgress = Math.max(0, Math.min(100, Math.round(message.progress * 100)));
        const bar = $('#ocrProgressBar');
        const label = $('#ocrProgressLabel');
        if (bar) bar.style.width = `${ocrProgress}%`;
        if (label) label.textContent = `${ocrProgress}%`;
      }
    });
    const result = await worker.recognize(pendingImportFile, {}, { blocks: true });
    rawOcrText = String(result?.data?.text || '').trim();
    const preview = $('.import-preview-image');
    recognizedCourses = parseTimetableBlocks(result?.data?.blocks || [], preview?.naturalWidth || 0);
    if (!recognizedCourses.length) recognizedCourses = parseTimetableText(rawOcrText);
    if (recognizedCourses.some(course => course.weeks)) {
      for (const course of recognizedCourses.filter(item => !item.weeks && item.ocrBox).slice(0, 6)) {
        const box = course.ocrBox;
        const crop = { left: Math.floor(box.left), top: Math.floor(box.top), width: Math.floor(Math.min(box.width, (preview?.naturalWidth || 0) - box.left)),
          height: Math.floor(Math.min(box.height, (preview?.naturalHeight || 0) - box.top)) };
        if (crop.width < 80 || crop.height < 40) continue;
        try {
          const detail = await worker.recognize(pendingImportFile, { rectangle: crop });
          course.weeks = weeksFromText(detail?.data?.text) || '';
        } catch (cropError) { console.warn('Timetable detail OCR skipped', cropError); }
      }
    }
    ocrStatus = 'done';
    render();
    toast(tr('imported'));
  } catch (error) {
    console.error('Timetable OCR failed', error);
    ocrStatus = 'failed';
    render();
  } finally {
    if (worker) await worker.terminate().catch(() => {});
  }
}

function imageFromTransfer(transfer) {
  const files = [...(transfer?.files || [])];
  const direct = files.find(isReadableImage);
  if (direct) return direct;
  for (const item of [...(transfer?.items || [])]) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      if (isReadableImage(file)) return file;
    }
  }
  return null;
}

function updateHistoryResults() {
  const results = currentHistoryResults();
  const count = $('#historyCount');
  const list = $('#historyResults');
  if (count) count.textContent = tr('historyResults').replaceAll('{n}', results.length);
  if (!list) return;
  list.innerHTML = historyResultsMarkup(results);
  $$('[data-edit-todo]', list).forEach(button => button.addEventListener('click', () => openEditTodo(button.dataset.editTodo)));
  $$('[data-edit-task]', list).forEach(button => button.addEventListener('click', () => openEditTask(button.dataset.editTask)));
}

function bindViewEvents() {
  $('#previousWeek')?.addEventListener('click', () => { weekOffset -= 1; render(); });
  $('#nextWeek')?.addEventListener('click', () => { weekOffset += 1; render(); });
  $('#startImport')?.addEventListener('click', () => { currentView = 'import'; render(); });
  $('#skipSetup')?.addEventListener('click', () => { state.settings.onboarded = true; saveState(); render(); });
  $('#importFromCourses')?.addEventListener('click', () => { currentView = 'import'; render(); });
  $('#clearCourses')?.addEventListener('click', () => $('#clearCoursesModal').showModal());
  $('#openHistory')?.addEventListener('click', () => { currentView = 'history'; render(); });
  $('#openTaskHistory')?.addEventListener('click', () => { historyType = 'task'; currentView = 'history'; render(); });
  $('#backToTodos')?.addEventListener('click', () => { currentView = 'todo'; render(); });
  $('#historySearch')?.addEventListener('input', event => { historyQuery = event.target.value; updateHistoryResults(); });
  $$('[data-history-type]').forEach(button => button.addEventListener('click', () => { historyType = button.dataset.historyType; render(); }));
  $$('[data-history-status]').forEach(button => button.addEventListener('click', () => { historyStatus = button.dataset.historyStatus; render(); }));
  $('#toggleTasks')?.addEventListener('click', () => { tasksExpanded = !tasksExpanded; render(); });
  $$('[data-task] .check').forEach(button => button.addEventListener('click', () => {
    const task = state.tasks.find(t => t.id === button.closest('[data-task]').dataset.task);
    task.done = !task.done;
    task.completedOn = task.done ? localISO() : '';
    saveState(); render();
  }));
  $$('[data-todo] .check').forEach(button => button.addEventListener('click', () => {
    const todo = state.todos.find(t => t.id === button.closest('[data-todo]').dataset.todo);
    todo.done = !todo.done;
    todo.completedOn = todo.done ? localISO() : '';
    saveState(); render();
  }));
  $$('[data-add]').forEach(button => button.addEventListener('click', () => openAdd(button.dataset.add)));
  $$('[data-edit-course]').forEach(button => button.addEventListener('click', () => openEditCourse(button.dataset.editCourse, button.dataset.editCourseDate || null)));
  $$('[data-edit-block]').forEach(button => button.addEventListener('click', () => openEditBlock(button.dataset.editBlock)));
  $$('[data-edit-task]').forEach(button => button.addEventListener('click', () => openEditTask(button.dataset.editTask)));
  $$('[data-edit-todo]').forEach(button => button.addEventListener('click', () => openEditTodo(button.dataset.editTodo)));
  bindTodoDrag();
  const file = $('#fileInput');
  file?.addEventListener('change', () => { if (file.files[0]) acceptTimetableImage(file.files[0]); });
  $('#startOcr')?.addEventListener('click', runOcr);
  $('#replaceImage')?.addEventListener('click', () => { if (file) { file.value = ''; file.click(); } });
  $$('.manual-import-button').forEach(button => button.addEventListener('click', () => openAdd('course')));
  $$('.remove-ocr-course').forEach(button => button.addEventListener('click', () => {
    button.closest('[data-ocr-course]')?.remove();
    const count = $$('[data-ocr-course]').length;
    const badge = $('.ocr-results-head span');
    const confirm = $('#confirmImport');
    if (badge) badge.textContent = String(count);
    if (confirm) { confirm.textContent = `${tr('confirmRecognized')} · ${count}`; confirm.disabled = count === 0; }
  }));
  $('#pasteImageButton')?.addEventListener('click', async event => {
    event.preventDefault();
    event.stopPropagation();
    if (!navigator.clipboard?.read) {
      toast(tr('clipboardDenied'));
      return;
    }
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (!imageType) continue;
        const blob = await item.getType(imageType);
        const extension = imageType.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
        acceptTimetableImage(new File([blob], `timetable.${extension}`, { type: imageType }));
        return;
      }
      toast(tr('clipboardEmpty'));
    } catch {
      toast(tr('clipboardDenied'));
    }
  });
  const dropZone = $('#dropZone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      dropZone.classList.add('drag-over');
    }));
    ['dragleave', 'dragend'].forEach(type => dropZone.addEventListener(type, () => dropZone.classList.remove('drag-over')));
    dropZone.addEventListener('drop', event => {
      event.preventDefault();
      dropZone.classList.remove('drag-over');
      const image = imageFromTransfer(event.dataTransfer);
      if (!image) {
        toast(tr('dropUnsupported'));
        return;
      }
      acceptTimetableImage(image);
    });
    dropZone.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        file?.click();
      }
    });
  }
  $('#confirmImport')?.addEventListener('click', () => {
    const colors = ['#337ccf', '#7289da', '#3c9a78', '#d98745', '#8d6bc4', '#cc6677'];
    const courses = $$('[data-ocr-course]').map((row, index) => ({
      id: `course-${Date.now()}-${index}`,
      title: $('[data-ocr-field="title"]', row)?.value.trim() || '',
      weekday: Number($('[data-ocr-field="weekday"]', row)?.value),
      place: $('[data-ocr-field="place"]', row)?.value.trim() || '',
      start: $('[data-ocr-field="start"]', row)?.value || '',
      end: $('[data-ocr-field="end"]', row)?.value || '',
      weeks: normalizeWeeks($('[data-ocr-field="weeks"]', row)?.value || ''),
      teacher: '',
      color: colors[index % colors.length]
    }));
    if (!courses.length || courses.some(course => !course.title || !course.start || !course.end || course.start >= course.end)) {
      toast(uiText('请补全课程名和上课时间', 'Complete each course name and time', '授業名と時刻を入力してください'));
      return;
    }
    if (courses.some(course => course.weeks === null)) {
      toast(uiText('请检查上课周数，例如 1-5,7-16', 'Check week ranges, for example 1-5,7-16', '授業週を確認してください（例：1-5,7-16）'));
      return;
    }
    const { additions, skipped } = mergeUniqueCourses(state.courses, courses);
    state.courses.push(...additions);
    state.settings.onboarded = true;
    importReviewVisible = false;
    pendingImportFile = null;
    if (pendingImportImageUrl) URL.revokeObjectURL(pendingImportImageUrl);
    pendingImportImageUrl = '';
    recognizedCourses = [];
    rawOcrText = '';
    ocrStatus = 'idle';
    saveState();
    currentView = 'courses';
    render();
    const importMessage = skipped
      ? tr(additions.length ? 'importMerged' : 'importNoNew').replaceAll('{added}', additions.length).replaceAll('{skipped}', skipped)
      : `${additions.length} ${tr('importComplete')}`;
    toast(importMessage);
  });
}

function bindTodoDrag() {
  let draggedId = null;
  $$('.todo-row[draggable]').forEach(row => {
    row.addEventListener('dragstart', () => { draggedId = row.dataset.todo; row.classList.add('dragging'); });
    row.addEventListener('dragend', () => { row.classList.remove('dragging'); $$('.todo-group').forEach(g=>g.classList.remove('drag-over')); });
  });
  $$('.todo-group').forEach(group => {
    if (!group.dataset.date) return;
    group.addEventListener('dragover', e => { e.preventDefault(); group.classList.add('drag-over'); });
    group.addEventListener('dragleave', () => group.classList.remove('drag-over'));
    group.addEventListener('drop', e => {
      e.preventDefault();
      const todo = state.todos.find(t => t.id === draggedId);
      if (!todo) return;
      todo.date = group.dataset.date;
      saveState(); render(); toast(tr('moved'));
    });
  });
}

function applyStaticTranslations() {
  $$('[data-i18n]').forEach(node => { node.textContent = tr(node.dataset.i18n); });
  $('#semesterLabel').textContent = state.settings.semester;
  const weekdayNames = state.settings.language === 'en' ? ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] : state.settings.language === 'ja' ? ['月曜日','火曜日','水曜日','木曜日','金曜日','土曜日','日曜日'] : ['周一','周二','周三','周四','周五','周六','周日'];
  $$('#courseWeekday option').forEach((option, index) => { option.textContent = weekdayNames[index]; });
}

function setTheme() {
  const resolved = state.settings.theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : state.settings.theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.setProperty('--font-scale', state.settings.font === 'small' ? '.92' : state.settings.font === 'large' ? '1.1' : '1');
  $('meta[name="theme-color"]').content = resolved === 'dark' ? '#101318' : '#f4f5f7';
}

function syncSettingsUI() {
  const release = window.UNIFLOW_VERSION;
  $('#appVersion').textContent = release ? `UniFlow ${release.version} (${release.build})` : 'UniFlow';
  $('#nameInput').value = state.settings.name;
  $('#semesterInput').value = state.settings.semester;
  $('#semesterStartInput').value = state.settings.semesterStart;
  $('#courseModeToggle').checked = state.settings.courseMode;
  [['themeControl','theme'],['fontControl','font'],['languageControl','language']].forEach(([id,key]) => {
    $$(`#${id} button`).forEach(button => button.classList.toggle('active', button.dataset.value === state.settings[key]));
  });
}

function openSettings() {
  syncSettingsUI();
  $('#settingsSheet').classList.add('open');
  $('#settingsSheet').setAttribute('aria-hidden','false');
  $('#scrim').hidden = false;
}

function closeSettings() {
  $('#settingsSheet').classList.remove('open');
  $('#settingsSheet').setAttribute('aria-hidden','true');
  $('#scrim').hidden = true;
}

function openAdd(type = currentView === 'todo' ? 'todo' : 'block') {
  editingCourseId = null;
  editingCourseDate = null;
  editingBlockId = null;
  editingTaskId = null;
  editingTodoId = null;
  addType = type;
  $('#itemDate').value = localISO();
  $('#itemTime').value = '';
  $('#planEnd').value = '';
  $('#itemTitle').value = '';
  $('#planLocation').value = '';
  $('#courseLocation').value = '';
  $('#courseWeeks').value = '';
  $('#courseStart').value = '08:00';
  $('#courseEnd').value = '09:40';
  $('#taskCarryFrom').value = localISO();
  $('#showCarryLabel').checked = true;
  $('[name="showSchedule"]').checked = false;
  updateAddType();
  $('#addModal').showModal();
  setTimeout(() => $('#itemTitle').focus(), 80);
}

function openEditCourse(id, occurrenceDate = null) {
  const course = state.courses.find(item => item.id === id);
  if (!course) return;
  editingCourseId = id;
  editingCourseDate = occurrenceDate;
  editingBlockId = null;
  editingTaskId = null;
  editingTodoId = null;
  addType = 'course';
  $('#itemTitle').value = course.title;
  $('#courseWeekday').value = String(course.weekday);
  $('#courseLocation').value = course.place || '';
  $('#courseStart').value = course.start;
  $('#courseEnd').value = course.end;
  $('#courseWeeks').value = course.weeks || '';
  updateAddType();
  $('#addModal').showModal();
  setTimeout(() => $('#itemTitle').focus(), 80);
}

function openEditBlock(id) {
  const block = state.blocks.find(item => item.id === id);
  if (!block) return;
  editingBlockId = id;
  editingCourseId = null;
  editingCourseDate = null;
  editingTaskId = null;
  editingTodoId = null;
  addType = 'block';
  $('#itemTitle').value = block.title;
  $('#itemDate').value = block.date;
  $('#itemTime').value = block.time || '';
  $('#planEnd').value = block.end || '';
  $('#planLocation').value = block.place || '';
  updateAddType();
  $('#addModal').showModal();
  setTimeout(() => $('#itemTitle').focus(), 80);
}

function openEditTodo(id) {
  const todo = state.todos.find(item => item.id === id);
  if (!todo) return;
  editingTodoId = id;
  editingBlockId = null;
  editingTaskId = null;
  editingCourseId = null;
  editingCourseDate = null;
  addType = 'todo';
  $('#itemTitle').value = todo.title;
  $('#itemDate').value = todo.date || localISO();
  $('#itemTime').value = todo.time || '';
  $('#planEnd').value = '';
  $('[name="showSchedule"]').checked = !!todo.schedule;
  updateAddType();
  $('#addModal').showModal();
  setTimeout(() => $('#itemTitle').focus(), 80);
}

function openEditTask(id) {
  const task = state.tasks.find(item => item.id === id);
  if (!task) return;
  editingTaskId = id;
  editingBlockId = null;
  editingTodoId = null;
  editingCourseId = null;
  editingCourseDate = null;
  addType = 'task';
  $('#itemTitle').value = task.title;
  $('#taskCarryFrom').value = task.carryFrom || task.createdOn || localISO();
  $('#showCarryLabel').checked = task.showCarryLabel !== false;
  updateAddType();
  $('#addModal').showModal();
  setTimeout(() => $('#itemTitle').focus(), 80);
}

function updateAddType() {
  const editing = editingCourseId !== null || editingBlockId !== null || editingTaskId !== null || editingTodoId !== null;
  $('#typePicker').hidden = editing;
  $$('#typePicker button').forEach(button => {
    const selected = button.dataset.type === addType;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  $('.plan-fields').hidden = addType === 'course' || addType === 'task';
  $('.plan-location-field').hidden = addType !== 'block';
  $('.plan-end-field').hidden = addType !== 'block';
  $('.course-fields').hidden = addType !== 'course';
  $('.task-carry-fields').hidden = !(addType === 'task' && editingTaskId);
  $('.schedule-field').hidden = addType !== 'todo';
  $('.time-field').hidden = addType === 'task';
  $('#itemDate').required = addType === 'block' || addType === 'todo';
  $('#courseStart').required = addType === 'course';
  $('#courseEnd').required = addType === 'course';
  $('#itemTimeLabel').textContent = tr(addType === 'block' ? 'startTime' : 'time');
  $('#itemDateLabel').textContent = tr(addType === 'todo' ? 'deadlineDate' : 'date');
  $('#modalEyebrow').textContent = editing ? tr('edit') : tr('newItem');
  $('#modalTitle').textContent = editingCourseId ? tr('editCourse') : editingBlockId ? tr('editPlan') : editingTaskId ? tr('editTask') : editingTodoId ? tr('editTodo') : addType === 'block' ? tr('addPlan') : addType === 'task' ? tr('addTask') : addType === 'course' ? tr('addCourse') : tr('addTodo');
  $('#deleteItemButton').hidden = !editing;
  $('#deleteItemButton').textContent = tr(editingCourseId && editingCourseDate ? 'removeThisWeek' : 'deleteThis');
}

function toast(message) {
  let node = $('.toast');
  if (!node) { node = document.createElement('div'); node.className = 'toast'; document.body.appendChild(node); }
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('show'), 1900);
}

$$('[data-view]').forEach(button => button.addEventListener('click', () => { currentView = button.dataset.view; render(); }));
$('#quickAdd').addEventListener('click', () => openAdd());
$('#mobileAdd').addEventListener('click', () => openAdd());
$('#openSettings').addEventListener('click', openSettings);
$('#mobileSettings').addEventListener('click', openSettings);
$('.mobile-brand')?.addEventListener('click', openSettings);
$('#closeSettings').addEventListener('click', closeSettings);
$('#scrim').addEventListener('click', closeSettings);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSettings(); if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') { e.preventDefault(); openAdd(); } });
document.addEventListener('paste', event => {
  if (currentView !== 'import') return;
  const image = imageFromTransfer(event.clipboardData);
  if (!image) return;
  event.preventDefault();
  acceptTimetableImage(image);
});

$('#nameInput').addEventListener('input', e => { state.settings.name = e.target.value.trim() || '同学'; saveState(); render(); });
$('#semesterInput').addEventListener('change', e => { state.settings.semester = e.target.value.trim() || defaults.settings.semester; saveState(); applyStaticTranslations(); render(); });
$('#semesterStartInput').addEventListener('change', e => { state.settings.semesterStart = e.target.value || ''; saveState(); render(); });
$('#courseModeToggle').addEventListener('change', e => { state.settings.courseMode = e.target.checked; saveState(); render(); });

[['themeControl','theme'],['fontControl','font'],['languageControl','language']].forEach(([id,key]) => {
  $$('#'+id+' button').forEach(button => button.addEventListener('click', () => {
    state.settings[key] = button.dataset.value;
    saveState(); setTheme(); applyStaticTranslations(); syncSettingsUI(); render();
  }));
});

$('#typePicker').addEventListener('click', e => { const button = e.target.closest('button[data-type]'); if (button) { addType = button.dataset.type; updateAddType(); } });
$('#typePicker').addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
  e.preventDefault();
  const buttons = $$('#typePicker button[data-type]');
  const focused = Math.max(0, buttons.indexOf(document.activeElement));
  const step = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
  const next = buttons[(focused + step + buttons.length) % buttons.length];
  next.focus();
  next.click();
});
$('#addModal').addEventListener('close', () => { editingCourseId = null; editingCourseDate = null; editingBlockId = null; editingTaskId = null; editingTodoId = null; });
$('#deleteItemModal').addEventListener('close', () => { pendingDeletion = null; });
$$('[data-close-modal]').forEach(button => button.addEventListener('click', () => button.closest('dialog')?.close()));
$('#deleteItemButton').addEventListener('click', () => {
  const type = editingCourseId && editingCourseDate ? 'courseOccurrence' : editingCourseId ? 'course' : editingBlockId ? 'block' : editingTaskId ? 'task' : editingTodoId ? 'todo' : null;
  const id = editingCourseId || editingBlockId || editingTaskId || editingTodoId;
  const collection = type === 'course' || type === 'courseOccurrence' ? state.courses : type === 'block' ? state.blocks : type === 'task' ? state.tasks : type === 'todo' ? state.todos : [];
  const item = collection.find(entry => entry.id === id);
  if (!item) return;
  pendingDeletion = { type, id, date: editingCourseDate };
  $('#deleteItemEyebrow').textContent = tr('delete');
  $('#deleteItemQuestion').textContent = tr(type === 'courseOccurrence' ? 'deleteOccurrenceQuestion' : 'deleteItemQuestion').replaceAll('{title}', item.title);
  $('#deleteItemHelp').textContent = tr(type === 'courseOccurrence' ? 'deleteOccurrenceHelp' : type === 'course' ? 'deleteCourseHelp' : 'deleteItemHelp');
  $('#deleteItemModal').showModal();
});
$('#confirmDeleteItem').addEventListener('click', () => {
  if (!pendingDeletion) return;
  const { type, id, date } = pendingDeletion;
  if (type === 'courseOccurrence') {
    const course = state.courses.find(item => item.id === id);
    if (!course || !date) return;
    excludeCourseOccurrence(course, date);
    $('#deleteItemModal').close();
    $('#addModal').close();
    saveState();
    render();
    toast(tr('removedThisWeek'));
    return;
  }
  const key = type === 'course' ? 'courses' : type === 'block' ? 'blocks' : type === 'task' ? 'tasks' : 'todos';
  const before = state[key].length;
  state[key] = state[key].filter(item => item.id !== id);
  $('#deleteItemModal').close();
  $('#addModal').close();
  if (state[key].length === before) return;
  saveState();
  render();
  toast(tr('deleted'));
});
$('#confirmClearCourses').addEventListener('click', () => {
  state.courses = [];
  saveState();
  $('#clearCoursesModal').close();
  render();
  toast(tr('timetableCleared'));
});
$('#addForm').addEventListener('submit', e => {
  e.preventDefault();
  const data = new FormData(e.target);
  const title = String(data.get('title') || '').trim();
  if (!title) return;
  const id = `${addType}-${Date.now()}`;
  let didUpdate = false;
  if (addType === 'task') {
    if (editingTaskId) {
      const existing = state.tasks.find(task => task.id === editingTaskId);
      if (!existing) return;
      existing.title = title;
      existing.carryFrom = String(data.get('carryFrom') || existing.createdOn || localISO());
      existing.showCarryLabel = data.get('showCarryLabel') === 'on';
      didUpdate = true;
    } else {
      state.tasks.push({ id, title, done: false, createdOn: localISO(), completedOn: '', carryFrom: '', showCarryLabel: true });
    }
  }
  if (addType === 'block') {
    const time = data.get('time') || '';
    const end = data.get('planEnd') || '';
    if (end && !time) { toast(uiText('请先选择开始时间', 'Choose a start time first', '開始時刻を先に選んでください')); return; }
    if (end && time >= end) { toast(uiText('结束时间要晚于开始时间', 'End time must be later than start time', '終了時刻は開始時刻より後にしてください')); return; }
    const changes = { title, date: data.get('date'), time, end, place: String(data.get('planLocation') || '').trim() };
    if (editingBlockId) {
      const existing = state.blocks.find(block => block.id === editingBlockId);
      if (!existing) return;
      Object.assign(existing, changes);
      didUpdate = true;
    } else {
      state.blocks.push({ id, ...changes, color: '#6b7fd7' });
    }
  }
  if (addType === 'todo') {
    const date = data.get('date') || '';
    if (!date) { toast(uiText('请选择具体的截止日期', 'Choose an exact deadline date', '具体的な締切日を選択してください')); return; }
    const changes = { title, date, time: data.get('time') || '', schedule: data.get('showSchedule') === 'on' };
    if (editingTodoId) {
      const existing = state.todos.find(todo => todo.id === editingTodoId);
      if (!existing) return;
      Object.assign(existing, changes);
      didUpdate = true;
    } else {
      state.todos.push({ id, ...changes, done: false, createdOn: localISO(), completedOn: '' });
    }
  }
  if (addType === 'course') {
    const weeks = normalizeWeeks(data.get('weeks'));
    if (weeks === null) { toast(uiText('请检查上课周数，例如 1-5,7-16', 'Check week ranges, for example 1-5,7-16', '授業週を確認してください（例：1-5,7-16）')); return; }
    if (data.get('courseStart') >= data.get('courseEnd')) { toast(uiText('结束时间要晚于开始时间', 'End time must be later than start time', '終了時刻は開始時刻より後にしてください')); return; }
    const changes = { title, weekday: Number(data.get('weekday')), start: data.get('courseStart'), end: data.get('courseEnd'), place: String(data.get('location') || '').trim(), weeks };
    if (editingCourseId) {
      const existing = state.courses.find(course => course.id === editingCourseId);
      if (!existing) return;
      Object.assign(existing, changes);
      didUpdate = true;
    } else {
      state.courses.push({ id, ...changes, teacher: '', color: '#337ccf' });
    }
  }
  state.settings.onboarded = true;
  saveState(); $('#addModal').close(); render(); toast(tr(didUpdate ? 'updated' : 'added'));
});

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (state.settings.theme === 'system') setTheme(); });

setTheme();
applyStaticTranslations();
syncSettingsUI();
render();
