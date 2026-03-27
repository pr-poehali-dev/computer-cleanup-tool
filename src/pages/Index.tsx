import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────

type CleanTask = { id: string; label: string; size: string; enabled: boolean };
type Module = { id: string; name: string; icon: string; color: string; glowRgb: string; tasks: CleanTask[] };
type LogEntry = { id: number; text: string; type: "info" | "success" };
type HistoryEntry = { date: string; freed: string; modules: string[] };
type Tab = "clean" | "schedule" | "stats" | "settings";

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_MODULES: Module[] = [
  {
    id: "chrome", name: "Google Chrome", icon: "Globe", color: "from-blue-500 to-cyan-400", glowRgb: "0,212,255",
    tasks: [
      { id: "chrome-cache", label: "Кэш браузера", size: "1.2 ГБ", enabled: true },
      { id: "chrome-cookies", label: "Cookies", size: "48 МБ", enabled: true },
      { id: "chrome-history", label: "История посещений", size: "22 МБ", enabled: false },
    ],
  },
  {
    id: "firefox", name: "Mozilla Firefox", icon: "Flame", color: "from-orange-500 to-amber-400", glowRgb: "255,107,53",
    tasks: [
      { id: "ff-cache", label: "Кэш браузера", size: "870 МБ", enabled: true },
      { id: "ff-temp", label: "Временные файлы", size: "134 МБ", enabled: true },
    ],
  },
  {
    id: "trash", name: "Корзина и остатки", icon: "Trash2", color: "from-purple-500 to-violet-400", glowRgb: "168,85,247",
    tasks: [
      { id: "trash-files", label: "Файлы в корзине", size: "3.4 ГБ", enabled: true },
      { id: "trash-residual", label: "Остаточные файлы", size: "215 МБ", enabled: true },
    ],
  },
  {
    id: "registry", name: "Системный реестр", icon: "Database", color: "from-rose-500 to-pink-400", glowRgb: "244,63,94",
    tasks: [
      { id: "reg-broken", label: "Битые записи", size: "12 МБ", enabled: true },
      { id: "reg-orphan", label: "Осиротевшие ключи", size: "8 МБ", enabled: false },
    ],
  },
  {
    id: "startup", name: "Автозагрузка", icon: "Power", color: "from-yellow-500 to-orange-400", glowRgb: "245,158,11",
    tasks: [
      { id: "startup-apps", label: "Лишние программы", size: "6 МБ", enabled: false },
      { id: "startup-tasks", label: "Задачи планировщика", size: "2 МБ", enabled: false },
    ],
  },
  {
    id: "duplicates", name: "Дубликаты файлов", icon: "Copy", color: "from-teal-500 to-emerald-400", glowRgb: "20,184,166",
    tasks: [
      { id: "dup-photos", label: "Дубликаты фото", size: "4.1 ГБ", enabled: false },
      { id: "dup-docs", label: "Дубликаты документов", size: "340 МБ", enabled: false },
    ],
  },
];

const LOG_MESSAGES: Record<string, { text: string; success?: boolean }[]> = {
  chrome: [
    { text: "Поиск профиля Chrome..." }, { text: "Обнаружен кэш: 1.2 ГБ" },
    { text: "Удаление файлов кэша..." }, { text: "Очистка cookies..." },
    { text: "Chrome: очистка завершена", success: true },
  ],
  firefox: [
    { text: "Поиск профиля Firefox..." }, { text: "Найдено: 870 МБ кэша" },
    { text: "Удаление временных файлов..." }, { text: "Firefox: готово", success: true },
  ],
  trash: [
    { text: "Анализ корзины..." }, { text: "Найдено объектов: 3.4 ГБ" },
    { text: "Поиск остаточных файлов..." }, { text: "Корзина очищена", success: true },
  ],
  registry: [
    { text: "Сканирование реестра..." }, { text: "Найдено битых записей: 284" },
    { text: "Очистка реестра..." }, { text: "Реестр оптимизирован", success: true },
  ],
  startup: [
    { text: "Проверка автозагрузки..." }, { text: "Отключение лишних программ..." },
    { text: "Автозагрузка оптимизирована", success: true },
  ],
  duplicates: [
    { text: "Поиск дубликатов..." }, { text: "Проверка хэшей файлов..." },
    { text: "Найдено дубликатов: 47" }, { text: "Удаление дубликатов..." },
    { text: "Дубликаты удалены", success: true },
  ],
};

const MOCK_HISTORY: HistoryEntry[] = [
  { date: "27 марта, 14:32", freed: "5.8 ГБ", modules: ["Chrome", "Firefox", "Корзина"] },
  { date: "25 марта, 09:15", freed: "2.1 ГБ", modules: ["Chrome", "Реестр"] },
  { date: "22 марта, 20:44", freed: "7.3 ГБ", modules: ["Firefox", "Корзина", "Дубликаты"] },
  { date: "18 марта, 11:00", freed: "1.4 ГБ", modules: ["Chrome"] },
  { date: "15 марта, 18:22", freed: "4.9 ГБ", modules: ["Корзина", "Дубликаты", "Автозагрузка"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseMb = (size: string) => {
  const m = size.match(/([\d.]+)\s*(ГБ|МБ)/);
  if (!m) return 0;
  return m[2] === "ГБ" ? parseFloat(m[1]) * 1024 : parseFloat(m[1]);
};

const fmtMb = (mb: number) =>
  mb >= 1024 ? `${(mb / 1024).toFixed(1)} ГБ` : `${Math.round(mb)} МБ`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModuleCard({ module, cleaning, onToggle }: {
  module: Module; cleaning: boolean;
  onToggle: (mid: string, tid: string) => void;
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{
          background: `linear-gradient(90deg, rgba(${module.glowRgb},0.12) 0%, transparent 100%)`,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center shrink-0`}
          style={{ boxShadow: `0 4px 20px rgba(${module.glowRgb},0.4)` }}
        >
          <Icon name={module.icon} size={20} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-white">{module.name}</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
            {module.tasks.filter((t) => t.enabled).length} из {module.tasks.length} выбрано
          </div>
        </div>
      </div>
      <div className="px-5 py-3 flex flex-col gap-2">
        {module.tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onToggle(module.id, task.id)}
            className="flex items-center justify-between p-3 rounded-xl transition-all duration-200"
            style={{
              background: task.enabled ? "rgba(255,255,255,0.05)" : "transparent",
              border: task.enabled ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.04)",
              opacity: task.enabled ? 1 : 0.5,
              cursor: cleaning ? "not-allowed" : "pointer",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  border: task.enabled ? "1.5px solid #00d4ff" : "1.5px solid rgba(255,255,255,0.2)",
                  background: task.enabled ? "rgba(0,212,255,0.15)" : "transparent",
                }}
              >
                {task.enabled && <Icon name="Check" size={11} style={{ color: "#00d4ff" }} />}
              </div>
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{task.label}</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: task.enabled ? "#00d4ff" : "rgba(255,255,255,0.25)" }}>
              {task.size}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Index() {
  const [tab, setTab] = useState<Tab>("clean");
  const [modules, setModules] = useState<Module[]>(INITIAL_MODULES);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalFreed, setTotalFreed] = useState("0 МБ");
  const [animIn, setAnimIn] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  // Schedule state
  const [schedEnabled, setSchedEnabled] = useState(false);
  const [schedTime, setSchedTime] = useState("03:00");
  const [schedDays, setSchedDays] = useState<string[]>(["mon", "wed", "fri"]);
  const [schedNotify, setSchedNotify] = useState(true);

  // History
  const [history, setHistory] = useState<HistoryEntry[]>(MOCK_HISTORY);

  // Settings
  const [settings, setSettings] = useState({
    theme: "dark",
    language: "ru",
    notifications: true,
    autoScan: false,
    deepScan: false,
    confirmDelete: true,
  });

  useEffect(() => { setTimeout(() => setAnimIn(true), 80); }, []);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs]);

  const toggleTask = (mid: string, tid: string) => {
    if (cleaning) return;
    setModules((prev) =>
      prev.map((m) => m.id === mid
        ? { ...m, tasks: m.tasks.map((t) => t.id === tid ? { ...t, enabled: !t.enabled } : t) }
        : m
      )
    );
  };

  const calcTotal = () => {
    let mb = 0;
    modules.forEach((m) => m.tasks.forEach((t) => { if (t.enabled) mb += parseMb(t.size); }));
    return fmtMb(mb);
  };

  const enabledCount = modules.reduce((acc, m) => acc + m.tasks.filter((t) => t.enabled).length, 0);

  const startCleaning = async () => {
    if (cleaning || enabledCount === 0) return;
    setCleaning(true); setDone(false); setProgress(0); setLogs([]);
    let idCounter = 0;
    const active = modules.filter((m) => m.tasks.some((t) => t.enabled));
    const totalSteps = active.reduce((acc, m) => acc + LOG_MESSAGES[m.id].length, 0);
    let step = 0;
    for (const m of active) {
      for (const msg of LOG_MESSAGES[m.id]) {
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 300));
        setLogs((prev) => [...prev, { id: ++idCounter, text: msg.text, type: msg.success ? "success" : "info" }]);
        step++;
        setProgress(Math.round((step / totalSteps) * 100));
      }
    }
    await new Promise((r) => setTimeout(r, 300));
    const freed = calcTotal();
    setProgress(100); setTotalFreed(freed); setDone(true); setCleaning(false);
    const now = new Date();
    const label = `${now.getDate()} ${["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"][now.getMonth()]}, ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setHistory((prev) => [{ date: label, freed, modules: active.map((m) => m.name.split(" ")[0]) }, ...prev]);
  };

  const reset = () => { setDone(false); setProgress(0); setLogs([]); setTotalFreed("0 МБ"); };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "clean", label: "Очистка", icon: "Zap" },
    { id: "schedule", label: "Расписание", icon: "Clock" },
    { id: "stats", label: "Статистика", icon: "BarChart2" },
    { id: "settings", label: "Настройки", icon: "Settings" },
  ];

  const DAYS = [
    { id: "mon", label: "Пн" }, { id: "tue", label: "Вт" }, { id: "wed", label: "Ср" },
    { id: "thu", label: "Чт" }, { id: "fri", label: "Пт" }, { id: "sat", label: "Сб" }, { id: "sun", label: "Вс" },
  ];

  const toggleDay = (d: string) =>
    setSchedDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const totalFreedHistory = history.reduce((acc, h) => acc + parseMb(h.freed), 0);

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      {/* Header */}
      <div
        className="max-w-5xl mx-auto mb-6"
        style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)",
              boxShadow: "0 0 35px rgba(0,212,255,0.5), 0 0 70px rgba(168,85,247,0.2)",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <Icon name="Zap" size={26} className="text-black" />
          </div>
          <div>
            <h1
              className="text-4xl md:text-5xl font-black tracking-tight leading-none"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                background: "linear-gradient(90deg, #00d4ff 0%, #a855f7 50%, #00ff88 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}
            >
              CleanMaster
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              Умная очистка браузеров и системы
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="max-w-5xl mx-auto mb-6"
        style={{ opacity: animIn ? 1 : 0, transition: "opacity 0.6s ease 200ms" }}
      >
        <div
          className="flex gap-1 p-1 rounded-2xl w-fit"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: tab === t.id ? "linear-gradient(135deg,#00d4ff20,#a855f720)" : "transparent",
                color: tab === t.id ? "#00d4ff" : "rgba(255,255,255,0.45)",
                border: tab === t.id ? "1px solid rgba(0,212,255,0.25)" : "1px solid transparent",
                boxShadow: tab === t.id ? "0 0 15px rgba(0,212,255,0.15)" : "none",
              }}
            >
              <Icon name={t.icon} size={15} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB: CLEAN ────────────────────────────────────────── */}
      {tab === "clean" && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-4">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                style={{
                  opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)",
                  transition: `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${120 + idx * 70}ms`,
                }}
              >
                <ModuleCard module={m} cleaning={cleaning} onToggle={toggleTask} />
              </div>
            ))}
          </div>

          {/* Control panel */}
          <div className="flex flex-col gap-4">
            <div
              className="glass rounded-2xl p-5"
              style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1) 500ms" }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                Сводка
              </div>
              <div className="text-center mb-5">
                <div
                  className="text-5xl font-black leading-none"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: done ? "#00ff88" : "#00d4ff",
                    textShadow: done ? "0 0 40px rgba(0,255,136,0.7)" : "0 0 40px rgba(0,212,255,0.7)",
                    transition: "all 0.6s ease",
                  }}
                >
                  {done ? totalFreed : calcTotal()}
                </div>
                <div className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.38)" }}>
                  {done ? "освобождено" : "будет очищено"}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { val: String(enabledCount), label: "задач" },
                  { val: String(modules.length), label: "модулей" },
                  { val: `${progress}%`, label: "готово", accent: done },
                ].map(({ val, label, accent }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div className="font-bold text-lg" style={{ color: accent ? "#00ff88" : "white" }}>{val}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
                  </div>
                ))}
              </div>
              {(cleaning || done) && (
                <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: done ? "linear-gradient(90deg,#00ff88,#00d4ff)" : "linear-gradient(90deg,#00d4ff,#a855f7)",
                      boxShadow: done ? "0 0 12px rgba(0,255,136,0.6)" : "0 0 12px rgba(0,212,255,0.6)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              )}
              {!done ? (
                <button
                  onClick={startCleaning}
                  disabled={cleaning || enabledCount === 0}
                  className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300"
                  style={{
                    background: cleaning || enabledCount === 0 ? "rgba(0,212,255,0.08)" : "linear-gradient(135deg,#00d4ff 0%,#a855f7 100%)",
                    color: cleaning || enabledCount === 0 ? "rgba(0,212,255,0.5)" : "#000",
                    boxShadow: cleaning || enabledCount === 0 ? "none" : "0 6px 30px rgba(0,212,255,0.4)",
                    border: cleaning || enabledCount === 0 ? "1px solid rgba(0,212,255,0.2)" : "none",
                    cursor: cleaning || enabledCount === 0 ? "not-allowed" : "pointer",
                    fontFamily: "'Golos Text', sans-serif", fontWeight: 700,
                  }}
                >
                  {cleaning ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="Loader2" size={16} className="animate-spin" />Очистка...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="Zap" size={16} />Начать очистку
                    </span>
                  )}
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="w-full py-4 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg,#00ff88 0%,#00d4ff 100%)", color: "#000", boxShadow: "0 6px 30px rgba(0,255,136,0.4)", cursor: "pointer", fontFamily: "'Golos Text', sans-serif", fontWeight: 700 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="RotateCcw" size={16} />Очистить снова
                  </span>
                </button>
              )}
            </div>

            {done && (
              <div
                className="glass rounded-2xl p-5 text-center animate-fade-in-up"
                style={{ border: "1px solid rgba(0,255,136,0.2)", background: "rgba(0,255,136,0.04)" }}
              >
                <div className="text-4xl mb-2 animate-checkmark block" style={{ color: "#00ff88" }}>✓</div>
                <div className="font-bold text-white text-base">Компьютер очищен!</div>
                <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Освобождено <span style={{ color: "#00ff88", fontWeight: 700 }}>{totalFreed}</span>
                </div>
              </div>
            )}

            {logs.length > 0 && (
              <div className="glass rounded-2xl p-4 animate-fade-in-up">
                <div className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: cleaning ? "#00d4ff" : done ? "#00ff88" : "rgba(255,255,255,0.3)",
                      boxShadow: cleaning ? "0 0 8px rgba(0,212,255,0.9)" : "none",
                    }}
                  />
                  Журнал
                </div>
                <div ref={logRef} className="flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight: "190px" }}>
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="text-xs py-1 px-2 rounded-lg"
                      style={{
                        color: log.type === "success" ? "#00ff88" : "rgba(255,255,255,0.55)",
                        background: log.type === "success" ? "rgba(0,255,136,0.07)" : "transparent",
                        fontFamily: "monospace",
                      }}
                    >
                      {log.type === "success" ? "✓ " : "› "}{log.text}
                    </div>
                  ))}
                  {cleaning && <div className="text-xs py-1 px-2 animate-pulse" style={{ color: "#00d4ff", fontFamily: "monospace" }}>▌</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: SCHEDULE ─────────────────────────────────────── */}
      {tab === "schedule" && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Toggle */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="font-bold text-white text-lg">Автоматическая очистка</div>
                <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Запускать очистку по расписанию
                </div>
              </div>
              <button
                onClick={() => setSchedEnabled(!schedEnabled)}
                className="w-14 h-7 rounded-full transition-all duration-300 relative shrink-0"
                style={{ background: schedEnabled ? "linear-gradient(90deg,#00d4ff,#a855f7)" : "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300"
                  style={{ left: schedEnabled ? "calc(100% - 24px)" : "4px" }}
                />
              </button>
            </div>

            <div className={`flex flex-col gap-5 transition-all duration-300 ${schedEnabled ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              <div>
                <div className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>Время запуска</div>
                <input
                  type="time"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 font-bold text-xl text-white"
                  style={{
                    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
                    outline: "none", colorScheme: "dark", fontFamily: "'Montserrat', sans-serif",
                  }}
                />
              </div>

              <div>
                <div className="text-sm font-semibold mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>Дни недели</div>
                <div className="flex gap-2 flex-wrap">
                  {DAYS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => toggleDay(d.id)}
                      className="w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200"
                      style={{
                        background: schedDays.includes(d.id) ? "linear-gradient(135deg,#00d4ff,#a855f7)" : "rgba(255,255,255,0.06)",
                        color: schedDays.includes(d.id) ? "#000" : "rgba(255,255,255,0.5)",
                        border: schedDays.includes(d.id) ? "none" : "1px solid rgba(255,255,255,0.08)",
                        boxShadow: schedDays.includes(d.id) ? "0 4px 15px rgba(0,212,255,0.3)" : "none",
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <div className="text-sm font-semibold text-white">Уведомление после очистки</div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>Показывать результат в трее</div>
                </div>
                <button
                  onClick={() => setSchedNotify(!schedNotify)}
                  className="w-12 h-6 rounded-full transition-all duration-300 relative shrink-0"
                  style={{ background: schedNotify ? "linear-gradient(90deg,#00d4ff,#a855f7)" : "rgba(255,255,255,0.1)" }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                    style={{ left: schedNotify ? "calc(100% - 22px)" : "2px" }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Следующий запуск
              </div>
              {schedEnabled && schedDays.length > 0 ? (
                <div>
                  <div
                    className="text-4xl font-black mb-2"
                    style={{ fontFamily: "'Montserrat', sans-serif", color: "#00d4ff", textShadow: "0 0 30px rgba(0,212,255,0.6)" }}
                  >
                    {schedTime}
                  </div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Каждые: {schedDays.map((d) => DAYS.find((x) => x.id === d)?.label).join(", ")}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "#00ff88" }}>
                    <Icon name="CheckCircle" size={16} />
                    <span>Расписание активно</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {!schedEnabled ? "Автоочистка отключена" : "Выберите хотя бы один день"}
                </div>
              )}
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Модули расписания
              </div>
              <div className="flex flex-col gap-2">
                {modules.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-2 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0`}
                      style={{ boxShadow: `0 2px 10px rgba(${m.glowRgb},0.3)` }}
                    >
                      <Icon name={m.icon} size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-white flex-1">{m.name}</span>
                    <div className="w-2 h-2 rounded-full" style={{ background: m.tasks.some((t) => t.enabled) ? "#00ff88" : "rgba(255,255,255,0.2)" }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: STATS ────────────────────────────────────────── */}
      {tab === "stats" && (
        <div className="max-w-5xl mx-auto flex flex-col gap-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Всего очищено", val: fmtMb(totalFreedHistory), icon: "HardDrive", color: "#00d4ff" },
              { label: "Запусков", val: String(history.length), icon: "Play", color: "#a855f7" },
              { label: "Этот месяц", val: fmtMb(totalFreedHistory * 0.6), icon: "Calendar", color: "#00ff88" },
              { label: "Среднее", val: fmtMb(totalFreedHistory / history.length), icon: "TrendingUp", color: "#ff6b35" },
            ].map((card) => (
              <div key={card.label} className="glass rounded-2xl p-5 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `rgba(${card.color === "#00d4ff" ? "0,212,255" : card.color === "#a855f7" ? "168,85,247" : card.color === "#00ff88" ? "0,255,136" : "255,107,53"},0.15)` }}>
                  <Icon name={card.icon} size={18} style={{ color: card.color }} />
                </div>
                <div className="text-2xl font-black" style={{ fontFamily: "'Montserrat', sans-serif", color: card.color }}>{card.val}</div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.38)" }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="glass rounded-2xl p-6">
            <div className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>
              Освобождено по дням
            </div>
            <div className="flex items-end gap-3 h-36">
              {history.slice().reverse().map((h, i) => {
                const mb = parseMb(h.freed);
                const maxMb = Math.max(...history.map((x) => parseMb(x.freed)));
                const pct = (mb / maxMb) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs font-bold" style={{ color: "#00d4ff" }}>{h.freed}</div>
                    <div className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden" style={{ height: `${pct}%`, background: "linear-gradient(180deg,#00d4ff,#a855f7)", boxShadow: "0 0 10px rgba(0,212,255,0.3)", minHeight: "8px" }}>
                      <div className="animate-shimmer absolute inset-0" />
                    </div>
                    <div className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>
                      {h.date.split(",")[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* History list */}
          <div className="glass rounded-2xl p-6">
            <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
              История очисток
            </div>
            <div className="flex flex-col gap-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-xl transition-all duration-200 hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.2)" }}>
                      <Icon name="CheckCircle" size={16} style={{ color: "#00ff88" }} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{h.date}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                        {h.modules.join(" · ")}
                      </div>
                    </div>
                  </div>
                  <div className="text-base font-black" style={{ fontFamily: "'Montserrat', sans-serif", color: "#00ff88" }}>{h.freed}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: SETTINGS ─────────────────────────────────────── */}
      {tab === "settings" && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* General */}
          <div className="glass rounded-2xl p-6">
            <div className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
              Основные
            </div>
            <div className="flex flex-col gap-4">
              {/* Language */}
              <div>
                <div className="text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>Язык интерфейса</div>
                <div className="flex gap-2">
                  {[{ id: "ru", label: "Русский" }, { id: "en", label: "English" }].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSettings((s) => ({ ...s, language: l.id }))}
                      className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: settings.language === l.id ? "linear-gradient(135deg,#00d4ff20,#a855f720)" : "rgba(255,255,255,0.04)",
                        color: settings.language === l.id ? "#00d4ff" : "rgba(255,255,255,0.45)",
                        border: settings.language === l.id ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div>
                <div className="text-sm font-semibold mb-2" style={{ color: "rgba(255,255,255,0.6)" }}>Тема оформления</div>
                <div className="flex gap-2">
                  {[{ id: "dark", label: "Тёмная", icon: "Moon" }, { id: "light", label: "Светлая", icon: "Sun" }].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSettings((s) => ({ ...s, theme: t.id }))}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
                      style={{
                        background: settings.theme === t.id ? "linear-gradient(135deg,#00d4ff20,#a855f720)" : "rgba(255,255,255,0.04)",
                        color: settings.theme === t.id ? "#00d4ff" : "rgba(255,255,255,0.45)",
                        border: settings.theme === t.id ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <Icon name={t.icon} size={14} />{t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {[
                { key: "notifications", label: "Уведомления", desc: "Push-уведомления о результатах очистки" },
                { key: "autoScan", label: "Автосканирование", desc: "Анализировать систему при запуске" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <div className="text-sm font-semibold text-white">{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{desc}</div>
                  </div>
                  <button
                    onClick={() => setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                    className="w-12 h-6 rounded-full transition-all duration-300 relative shrink-0"
                    style={{ background: settings[key as keyof typeof settings] ? "linear-gradient(90deg,#00d4ff,#a855f7)" : "rgba(255,255,255,0.1)" }}
                  >
                    <div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                      style={{ left: settings[key as keyof typeof settings] ? "calc(100% - 22px)" : "2px" }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced */}
          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
                Дополнительно
              </div>
              <div className="flex flex-col gap-4">
                {[
                  { key: "deepScan", label: "Глубокое сканирование", desc: "Занимает больше времени, но находит больше мусора" },
                  { key: "confirmDelete", label: "Подтверждение удаления", desc: "Спрашивать перед удалением файлов" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div>
                      <div className="text-sm font-semibold text-white">{label}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>{desc}</div>
                    </div>
                    <button
                      onClick={() => setSettings((s) => ({ ...s, [key]: !s[key as keyof typeof s] }))}
                      className="w-12 h-6 rounded-full transition-all duration-300 relative shrink-0"
                      style={{ background: settings[key as keyof typeof settings] ? "linear-gradient(90deg,#00d4ff,#a855f7)" : "rgba(255,255,255,0.1)" }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300"
                        style={{ left: settings[key as keyof typeof settings] ? "calc(100% - 22px)" : "2px" }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="glass rounded-2xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                О программе
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg,#00d4ff,#a855f7)", boxShadow: "0 0 20px rgba(0,212,255,0.4)" }}
                >
                  <Icon name="Zap" size={24} className="text-black" />
                </div>
                <div>
                  <div className="font-black text-white text-lg" style={{ fontFamily: "'Montserrat', sans-serif" }}>CleanMaster</div>
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Версия 1.2.0</div>
                </div>
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)", lineHeight: "1.6" }}>
                Умная утилита для очистки браузеров, системного мусора и дубликатов файлов.
              </div>
              <button
                className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{ background: "rgba(0,212,255,0.08)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}
              >
                Проверить обновления
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
