import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Home,
  Pause,
  PenLine,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import brainStage1 from './assets/brain-stages/brain-1-curious.png';
import brainStage2 from './assets/brain-stages/brain-2-reading.png';
import brainStage3 from './assets/brain-stages/brain-3-focus.png';
import brainStage4 from './assets/brain-stages/brain-4-hero.png';
import brainStage5 from './assets/brain-stages/brain-5-research.png';
import brainStage6 from './assets/brain-stages/brain-6-success.png';
import logo from './assets/gongbu_logo.png';


const STORAGE_KEY = 'gongbuhaennoy-study-records-v1';
const LEGACY_STORAGE_KEYS = ['braingrow-study-records-v2'];
const DAILY_GOAL = 240;
const EXP_PER_LEVEL = 300;

const SUBJECTS = [
  { name: '수학', color: '#5ed68c', icon: '수' },
  { name: '영어', color: '#6682ff', icon: '영' },
  { name: '국어', color: '#ffb45f', icon: '국' },
  { name: '과학', color: '#45b8db', icon: '과' },
  { name: '사회', color: '#c77df1', icon: '사' },
  { name: '기타', color: '#9aa5bc', icon: '기' },
];

const QUOTES = [
  '오늘의 작은 기록이 내일의 큰 실력이 됩니다.',
  '공부한 시간만큼 뇌도 조용히 자라고 있어요.',
  '완벽한 하루보다 기록하는 하루가 더 강합니다.',
  '짧게라도 꾸준히 쌓으면 분명히 달라집니다.',
];

const GROWTH_STAGES = [
  { minExp: 0, name: '호기심 뇌', image: brainStage1 },
  { minExp: 300, name: '독서 뇌', image: brainStage2 },
  { minExp: 600, name: '집중 뇌', image: brainStage3 },
  { minExp: 900, name: '도전 뇌', image: brainStage4 },
  { minExp: 1200, name: '탐구 뇌', image: brainStage5 },
  { minExp: 1500, name: '성취 뇌', image: brainStage6 },
];

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalTime(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getLocalTimeWithSeconds(date = new Date()) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function getDailyQuoteIndex(dateText) {
  return [...dateText].reduce((sum, char) => sum + char.charCodeAt(0), 0) % QUOTES.length;
}

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(date);
}

function formatFullDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(date);
}

function formatMinutes(minutes) {
  if (!minutes) return '0분';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

function formatClock(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainSeconds = safeSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainSeconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(remainSeconds).padStart(2, '0')}`;
}

function formatElapsed(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;
  if (minutes === 0) return `${remainSeconds}초`;
  if (remainSeconds === 0) return formatMinutes(minutes);
  return `${formatMinutes(minutes)} ${remainSeconds}초`;
}

function getPlannedMinutes(record) {
  return record.plannedMinutes ?? record.minutes ?? 0;
}

function getEarnedSeconds(record) {
  if (typeof record.studiedSeconds === 'number') return record.studiedSeconds;
  return (record.earnedMinutes ?? 0) * 60;
}

function getEarnedMinutes(record) {
  return Math.floor(getEarnedSeconds(record) / 60);
}

function getRemainingSeconds(record) {
  if (typeof record.remainingSeconds === 'number') return record.remainingSeconds;
  return getPlannedMinutes(record) * 60;
}

function getSubject(subject) {
  return SUBJECTS.find((item) => item.name === subject) || SUBJECTS[SUBJECTS.length - 1];
}

function getLastSevenDays() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return getLocalDate(date);
  });
}

function parseStoredRecords(value) {
  if (!value) return [];

  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
}

function loadStudyRecords() {
  if (typeof window === 'undefined' || !window.localStorage) return [];

  const storageKeys = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS];
  for (const key of storageKeys) {
    try {
      const records = parseStoredRecords(window.localStorage.getItem(key));
      if (records.length > 0) return records;
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  return [];
}

function saveStudyRecords(records) {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage can fail in private mode or when the browser quota is full.
  }
}

function useStudyRecords() {
  const [records, setRecords] = useState(loadStudyRecords);

  useEffect(() => {
    saveStudyRecords(records);
  }, [records]);

  return [records, setRecords];
}

function Header({ view, setView, today, currentTime }) {
  const tabs = [
    { id: 'home', label: '홈', icon: Home },
    { id: 'record', label: '공부 기록', icon: FileText },
    { id: 'stats', label: '통계 & 복습', icon: BarChart3 },
  ];

  return (
    <header className="topbar">
      <button className="brand" onClick={() => setView('home')}>
        <img src={logo} alt="공부했뇌 로고" className="logo" />
      </button>
      <nav className="nav-tabs" aria-label="주요 메뉴">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} className={view === id ? 'active' : ''} onClick={() => setView(id)}>
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="today-chip">
        <CalendarDays size={16} />
        <span>{formatFullDate(today)} {currentTime}</span>
      </div>
    </header>
  );
}

function BrainCharacter({ level, expInLevel, expTarget, totalMinutes }) {
  const stage = GROWTH_STAGES.reduce((currentStage, item, index) => (
    totalMinutes >= item.minExp ? index : currentStage
  ), 0);
  const nextStage = GROWTH_STAGES[stage + 1];
  const percent = Math.round((expInLevel / expTarget) * 100);

  return (
    <section className="brain-card panel">
      <div className={`brain-stage stage-${stage}`}>
        <div className="brain-art-float">
          <img
            className="brain-art"
            src={GROWTH_STAGES[stage].image}
            alt={`${GROWTH_STAGES[stage].name} 캐릭터`}
          />
        </div>
      </div>
      <div className="brain-meta">
        <span>{GROWTH_STAGES[stage].name}</span>
        <h1>LV. {level}</h1>
        <p>누적 경험치 {totalMinutes} EXP</p>
      </div>
      <div className="progress-label">
        <b>{expInLevel} / {expTarget} EXP</b>
        <span>{percent}%</span>
      </div>
      <div className="progress">
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className="next-exp">
        {nextStage
          ? `${nextStage.name}까지 ${Math.max(nextStage.minExp - totalMinutes, 0)} EXP`
          : '최종 성장 단계 달성!'}
      </p>
    </section>
  );
}

function TodayStatus({ todayMinutes, todayCount }) {
  const percent = Math.min(100, Math.round((todayMinutes / DAILY_GOAL) * 100));

  return (
    <section className="panel today-panel">
      <h2>오늘의 공부 현황</h2>
      <div className="today-layout">
        <div className="ring" style={{ '--percent': `${percent * 3.6}deg` }}>
          <Clock3 size={25} />
        </div>
        <div className="today-copy">
          <span>오늘 공부 시간</span>
          <strong>{formatMinutes(todayMinutes)}</strong>
          <small>목표 시간 {formatMinutes(DAILY_GOAL)}</small>
          <div className="goal-line">
            <div><span style={{ width: `${percent}%` }} /></div>
            <b>{percent}%</b>
          </div>
        </div>
      </div>
      <span className="record-count">기록 {todayCount}개</span>
    </section>
  );
}

function QuoteCard({ today }) {
  const quote = QUOTES[getDailyQuoteIndex(today)];

  return (
    <section className="panel quote-card">
      <span className="quote-cloud cloud-left" />
      <span className="quote-cloud cloud-right" />
      <span className="quote-plant" />
      <h2>오늘의 한마디</h2>
      <p>“{quote}”</p>
      <Sparkles size={22} />
    </section>
  );
}

function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <Brain size={34} />
      <strong>{title}</strong>
      <span>{message}</span>
      {actionLabel && <button onClick={onAction}>{actionLabel}</button>}
    </div>
  );
}

function RecentRecords({ records, setView }) {
  return (
    <section className="panel recent-panel">
      <div className="section-head">
        <h2>최근 기록</h2>
        <button onClick={() => setView('record')}>전체 보기</button>
      </div>
      {records.length === 0 ? (
        <EmptyState
          title="아직 기록이 없어요"
          message="공부를 기록하면 이곳에 바로 나타납니다."
          actionLabel="기록하기"
          onAction={() => setView('record')}
        />
      ) : (
        <div className="record-list compact">
          {records.slice(0, 3).map((record) => (
            <RecordItem key={record.id} record={record} compact />
          ))}
        </div>
      )}
    </section>
  );
}

function HomeView({ records, today, currentTime, setView }) {
  const totalExp = records.reduce((sum, item) => sum + getEarnedMinutes(item), 0);
  const level = Math.max(1, Math.floor(totalExp / EXP_PER_LEVEL) + 1);
  const expInLevel = totalExp % EXP_PER_LEVEL;
  const todayRecords = records.filter((item) => item.date === today);
  const todayMinutes = todayRecords.reduce((sum, item) => sum + getEarnedMinutes(item), 0);

  return (
    <main className="home-grid page">
      <BrainCharacter level={level} expInLevel={expInLevel} expTarget={EXP_PER_LEVEL} totalMinutes={totalExp} />
      <div className="middle-stack">
        <TodayStatus todayMinutes={todayMinutes} todayCount={todayRecords.length} />
        <QuoteCard today={today} />
      </div>
      <aside className="right-stack">
        <button className="cta" onClick={() => setView('record')}>
          <span><PenLine size={23} /> 공부 기록하기</span>
          <small>기록을 추가하면 경험치와 뇌 캐릭터가 함께 성장합니다.</small>
          <ChevronRight className="cta-arrow" size={28} />
        </button>
        <RecentRecords records={records} setView={setView} />
      </aside>
    </main>
  );
}

function RecordItem({ record, onDelete, onReview, compact = false }) {
  const subject = getSubject(record.subject);

  return (
    <article className="record-item">
      <div className="subject-badge" style={{ '--subject-color': subject.color }}>{subject.icon}</div>
      <div className="record-body">
        <strong>{record.subject}</strong>
        <span>{record.content}</span>
      </div>
      <b>{formatMinutes(getEarnedMinutes(record))}</b>
      <time>{record.date === getLocalDate() ? record.time : formatDate(record.date)}</time>
      {!compact && (
        <div className="item-actions">
          <button onClick={() => onReview(record.id)} aria-label="복습 완료 표시"><CheckCircle2 size={17} /></button>
          <button onClick={() => onDelete(record.id)} aria-label="기록 삭제"><Trash2 size={17} /></button>
        </div>
      )}
    </article>
  );
}

function TimerRecordItem({ record, isActive, onStart, onStop, onDelete, onReview }) {
  const subject = getSubject(record.subject);
  const plannedSeconds = getPlannedMinutes(record) * 60;
  const remainingSeconds = getRemainingSeconds(record);
  const earnedSeconds = getEarnedSeconds(record);
  const progress = plannedSeconds > 0 ? Math.min(100, Math.round((earnedSeconds / plannedSeconds) * 100)) : 0;
  const canReview = remainingSeconds <= 0;

  return (
    <article className={`timer-record ${isActive ? 'running' : ''}`}>
      <div className="subject-badge" style={{ '--subject-color': subject.color }}>{subject.icon}</div>
      <div className="timer-main">
        <div className="timer-title">
          <strong>{record.subject}</strong>
          <span>{record.content}</span>
        </div>
        <div className="timer-progress">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="timer-meta">
          <span>남은 시간 {formatClock(remainingSeconds)}</span>
          <span>공부한 시간 {formatClock(earnedSeconds)}</span>
          <span>계획 {formatMinutes(getPlannedMinutes(record))}</span>
        </div>
      </div>
      <div className="timer-actions">
        {isActive ? (
          <button className="pause-btn" onClick={() => onStop(record.id)}><Pause size={17} /> 정지</button>
        ) : (
          <button className="play-btn" onClick={() => onStart(record.id)} disabled={remainingSeconds <= 0}><Play size={17} /> 시작</button>
        )}
        <button
          className="icon-btn tooltip-btn"
          onClick={() => onReview(record.id)}
          aria-label={canReview ? '복습 체크' : '공부 시간을 다 채운 뒤 복습 체크 가능'}
          data-tooltip={canReview ? '복습 체크' : '시간 완료 후 가능'}
          disabled={!canReview}
        >
          <CheckCircle2 size={17} />
        </button>
        <button className="icon-btn danger" onClick={() => onDelete(record.id)} aria-label="기록 삭제"><Trash2 size={17} /></button>
      </div>
    </article>
  );
}

function RecordView({ records, setRecords, today }) {
  const [form, setForm] = useState({ subject: '수학', content: '', hours: '1', minutes: '0' });
  const [activeTimerId, setActiveTimerId] = useState(null);
  const todayRecords = records.filter((item) => item.date === today && !item.reviewed && !item.hiddenFromToday);
  const todayTotalSeconds = todayRecords.reduce((sum, item) => sum + getEarnedSeconds(item), 0);
  const todayTotal = Math.floor(todayTotalSeconds / 60);

  useEffect(() => {
    if (!activeTimerId) return undefined;

    const timer = setInterval(() => {
      setRecords((prev) => prev.map((record) => {
        if (record.id !== activeTimerId) return record;

        const remainingSeconds = getRemainingSeconds(record);
        if (remainingSeconds <= 0) {
          setActiveTimerId(null);
          return record;
        }

        return {
          ...record,
          remainingSeconds: remainingSeconds - 1,
          studiedSeconds: getEarnedSeconds(record) + 1,
          completed: remainingSeconds - 1 <= 0,
        };
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimerId, setRecords]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function submitRecord(event) {
    event.preventDefault();
    const minutes = Number(form.hours) * 60 + Number(form.minutes);
    if (!form.subject || !form.content.trim() || minutes <= 0) return;

    setRecords((prev) => [
      {
        id: crypto.randomUUID(),
        subject: form.subject,
        content: form.content.trim(),
        plannedMinutes: minutes,
        minutes,
        remainingSeconds: minutes * 60,
        studiedSeconds: 0,
        date: today,
        time: getLocalTime(),
        reviewed: false,
        completed: false,
      },
      ...prev,
    ]);
    setForm({ subject: form.subject, content: '', hours: '1', minutes: '0' });
  }

  function deleteRecord(id) {
    setRecords((prev) => prev.flatMap((record) => {
      if (record.id !== id) return [record];
      if (getEarnedSeconds(record) > 0) return [{ ...record, hiddenFromToday: true }];
      return [];
    }));
    if (activeTimerId === id) setActiveTimerId(null);
  }

  function markReview(id) {
    setRecords((prev) => prev.map((record) => record.id === id ? { ...record, reviewed: true } : record));
    if (activeTimerId === id) setActiveTimerId(null);
  }

  return (
    <main className="record-grid page">
      <form className="panel form-panel" onSubmit={submitRecord}>
        <h2>공부 기록하기</h2>
        <label>
          과목
          <select name="subject" value={form.subject} onChange={updateForm}>
            {SUBJECTS.map((subject) => <option key={subject.name}>{subject.name}</option>)}
          </select>
        </label>
        <label>
          공부 내용
          <textarea name="content" value={form.content} onChange={updateForm} placeholder="예: 수능특강 독서 3지문 분석" />
        </label>
        <div className="time-inputs">
          <label>
            시간
            <select name="hours" value={form.hours} onChange={updateForm}>
              {[0, 1, 2, 3, 4, 5, 6].map((hour) => <option key={hour} value={hour}>{hour}</option>)}
            </select>
          </label>
          <label>
            분
            <select name="minutes" value={form.minutes} onChange={updateForm}>
              {[0, 10, 20, 30, 40, 50].map((minute) => <option key={minute} value={minute}>{minute}</option>)}
            </select>
          </label>
        </div>
        <button className="save-btn" type="submit"><Save size={18} /> 공부 항목 추가</button>
        <p className="save-note"><Brain size={16} /> 추가한 항목은 시작 버튼으로 시간을 기록합니다.</p>
      </form>

      <section className="panel day-panel">
        <div className="section-head">
          <h2>오늘의 기록</h2>
          <span>총 {todayRecords.length}개 / {formatElapsed(todayTotalSeconds)}</span>
        </div>
        {todayRecords.length === 0 ? (
          <EmptyState title="오늘 기록이 비어 있어요" message="왼쪽 폼에서 첫 공부 기록을 추가해보세요." />
        ) : (
          <div className="record-list">
            {todayRecords.map((record) => (
              <TimerRecordItem
                key={record.id}
                record={record}
                isActive={activeTimerId === record.id}
                onStart={setActiveTimerId}
                onStop={() => setActiveTimerId(null)}
                onDelete={deleteRecord}
                onReview={markReview}
              />
            ))}
          </div>
        )}
        <div className="daily-summary">
          <div className="summary-card">
            <span className="summary-icon"><Clock3 size={22} /></span>
            <span className="summary-text">
              <span>오늘 공부</span>
              <strong>{formatElapsed(todayTotalSeconds)}</strong>
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-icon"><Sparkles size={22} /></span>
            <span className="summary-text">
              <span>획득 경험치</span>
              <strong>+{todayTotal} EXP</strong>
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatsView({ records, setRecords }) {
  const days = useMemo(getLastSevenDays, []);
  const studyRecords = useMemo(() => records.filter((record) => getEarnedSeconds(record) > 0), [records]);
  const byDate = useMemo(() => days.map((date) => ({
    date,
    label: date.slice(5).replace('-', '/'),
    minutes: studyRecords.filter((record) => record.date === date).reduce((sum, record) => sum + getEarnedMinutes(record), 0),
  })), [days, studyRecords]);

  const total = studyRecords.reduce((sum, item) => sum + getEarnedMinutes(item), 0);
  const chartTotal = total || 1;
  const subjectStats = SUBJECTS.map((subject) => ({
    ...subject,
    minutes: studyRecords.filter((record) => record.subject === subject.name).reduce((sum, record) => sum + getEarnedMinutes(record), 0),
  })).filter((item) => item.minutes > 0);

  const reviewTargets = studyRecords.filter((record) => !record.reviewed).slice().sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
  const maxMinutes = Math.max(...byDate.map((item) => item.minutes), DAILY_GOAL);
  const points = byDate.map((item, index) => {
    const x = 44 + index * 80;
    const y = 220 - (item.minutes / maxMinutes) * 170;
    return `${x},${y}`;
  }).join(' ');
  const donutBackground = subjectStats.length
    ? `conic-gradient(${subjectStats.map((item, index) => {
      const before = subjectStats.slice(0, index).reduce((sum, stat) => sum + stat.minutes, 0) / chartTotal * 100;
      const after = before + item.minutes / chartTotal * 100;
      return `${item.color} ${before}% ${after}%`;
    }).join(', ')})`
    : 'conic-gradient(#e4e9f4 0 100%)';

  function startReview() {
    const targetIds = reviewTargets.map((record) => record.id);
    setRecords((prev) => prev.map((record) => targetIds.includes(record.id) ? { ...record, reviewed: true } : record));
  }

  function resetAll() {
    if (window.confirm('공부 시간이 없는 빈 항목만 정리할까요? 공부 데이터는 통계에 남습니다.')) {
      setRecords((prev) => prev.filter((record) => getEarnedSeconds(record) > 0));
    }
  }

  return (
    <main className="stats-grid page">
      <section className="panel chart-panel">
        <h2>최근 7일 공부 시간</h2>
        <svg viewBox="0 0 560 250" role="img" aria-label="최근 7일 공부 시간 그래프">
          {[0, 60, 120, 180, 240].map((tick) => (
            <g key={tick}>
              <line x1="32" x2="535" y1={220 - (tick / maxMinutes) * 170} y2={220 - (tick / maxMinutes) * 170} />
              <text x="5" y={225 - (tick / maxMinutes) * 170}>{tick}</text>
            </g>
          ))}
          <polyline points={`44,220 ${points} 524,220`} className="area" />
          <polyline points={points} className="line" />
          {byDate.map((item, index) => (
            <g key={item.date}>
              <circle cx={44 + index * 80} cy={220 - (item.minutes / maxMinutes) * 170} r="5" />
              <text className="x-label" x={24 + index * 80} y="244">{item.label}</text>
            </g>
          ))}
        </svg>
      </section>

      <section className="panel donut-panel">
        <h2>과목별 학습 비율</h2>
        <div className="donut-wrap">
          <div className="donut" style={{ background: donutBackground }} />
          <div className="legend">
            {subjectStats.length === 0 ? (
              <span className="empty-legend">기록을 추가하면 비율이 표시됩니다.</span>
            ) : subjectStats.map((item) => (
              <div key={item.name}>
                <span style={{ background: item.color }} />
                <b>{item.name}</b>
                <strong>{Math.round((item.minutes / chartTotal) * 100)}% ({formatMinutes(item.minutes)})</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel history-panel">
        <div className="section-head">
          <h2>전체 학습 기록</h2>
          <button className="ghost-btn" onClick={resetAll}><RotateCcw size={16} /> 빈 기록 정리</button>
        </div>
        {studyRecords.length === 0 ? (
          <EmptyState title="분석할 기록이 없어요" message="공부 기록을 저장하면 통계가 자동으로 만들어집니다." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>날짜</th><th>과목</th><th>내용</th><th>시간</th><th>복습</th></tr>
              </thead>
              <tbody>
                {studyRecords.slice().sort((a, b) => b.date.localeCompare(a.date)).map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.subject}</td>
                    <td>{record.content}</td>
                    <td>{formatMinutes(getEarnedMinutes(record))}</td>
                    <td><span className={record.reviewed ? 'done-pill' : 'review-pill'}>{record.reviewed ? '완료' : '대기'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <aside className="panel review-panel">
        <h2>복습이 필요한 기록</h2>
        <p>{reviewTargets.length}개의 기록이 복습을 기다리고 있어요.</p>
        <div className="review-visual">
          <BookOpen size={46} />
          <RefreshCw size={32} />
        </div>
        <button onClick={startReview} disabled={reviewTargets.length === 0}>복습 완료하기</button>
      </aside>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [records, setRecords] = useStudyRecords();
  const [now, setNow] = useState(new Date());
  const today = getLocalDate(now);
  const currentTime = getLocalTimeWithSeconds(now);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  return (
    <div className="app-shell">
      <Header view={view} setView={setView} today={today} currentTime={currentTime} />
      {view === 'home' && <HomeView records={records} today={today} currentTime={currentTime} setView={setView} />}
      {view === 'record' && <RecordView records={records} setRecords={setRecords} today={today} />}
      {view === 'stats' && <StatsView records={records} setRecords={setRecords} />}
    </div>
  );
}