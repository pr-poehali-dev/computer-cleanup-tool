import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

type CleanTask = {
  id: string;
  label: string;
  size: string;
  enabled: boolean;
};

type BrowserModule = {
  id: string;
  name: string;
  icon: string;
  color: string;
  glowRgb: string;
  tasks: CleanTask[];
};

type LogEntry = {
  id: number;
  text: string;
  type: "info" | "success";
};

const INITIAL_BROWSERS: BrowserModule[] = [
  {
    id: "chrome",
    name: "Google Chrome",
    icon: "Globe",
    color: "from-blue-500 to-cyan-400",
    glowRgb: "0,212,255",
    tasks: [
      { id: "chrome-cache", label: "Кэш браузера", size: "1.2 ГБ", enabled: true },
      { id: "chrome-cookies", label: "Cookies", size: "48 МБ", enabled: true },
      { id: "chrome-history", label: "История посещений", size: "22 МБ", enabled: false },
    ],
  },
  {
    id: "firefox",
    name: "Mozilla Firefox",
    icon: "Flame",
    color: "from-orange-500 to-amber-400",
    glowRgb: "255,107,53",
    tasks: [
      { id: "ff-cache", label: "Кэш браузера", size: "870 МБ", enabled: true },
      { id: "ff-temp", label: "Временные файлы", size: "134 МБ", enabled: true },
    ],
  },
  {
    id: "trash",
    name: "Корзина и остатки",
    icon: "Trash2",
    color: "from-purple-500 to-violet-400",
    glowRgb: "168,85,247",
    tasks: [
      { id: "trash-files", label: "Файлы в корзине", size: "3.4 ГБ", enabled: true },
      { id: "trash-residual", label: "Остаточные файлы", size: "215 МБ", enabled: true },
    ],
  },
];

const LOG_MESSAGES: Record<string, { text: string; success?: boolean }[]> = {
  chrome: [
    { text: "Поиск профиля Chrome..." },
    { text: "Обнаружен кэш: 1.2 ГБ" },
    { text: "Удаление файлов кэша..." },
    { text: "Очистка cookies..." },
    { text: "Chrome: очистка завершена", success: true },
  ],
  firefox: [
    { text: "Поиск профиля Firefox..." },
    { text: "Найдено: 870 МБ кэша" },
    { text: "Удаление временных файлов..." },
    { text: "Firefox: готово", success: true },
  ],
  trash: [
    { text: "Анализ корзины..." },
    { text: "Найдено объектов: 3.4 ГБ" },
    { text: "Поиск остаточных файлов..." },
    { text: "Очистка системного мусора..." },
    { text: "Корзина очищена", success: true },
  ],
};

export default function Index() {
  const [browsers, setBrowsers] = useState<BrowserModule[]>(INITIAL_BROWSERS);
  const [cleaning, setCleaning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [totalFreed, setTotalFreed] = useState("0 МБ");
  const [animIn, setAnimIn] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 80);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const toggleTask = (browserId: string, taskId: string) => {
    if (cleaning) return;
    setBrowsers((prev) =>
      prev.map((b) =>
        b.id === browserId
          ? { ...b, tasks: b.tasks.map((t) => (t.id === taskId ? { ...t, enabled: !t.enabled } : t)) }
          : b
      )
    );
  };

  const calcTotalMb = () => {
    let totalMb = 0;
    browsers.forEach((b) => {
      b.tasks.forEach((t) => {
        if (t.enabled) {
          const m = t.size.match(/([\d.]+)\s*(ГБ|МБ)/);
          if (m) totalMb += m[2] === "ГБ" ? parseFloat(m[1]) * 1024 : parseFloat(m[1]);
        }
      });
    });
    return totalMb >= 1024 ? `${(totalMb / 1024).toFixed(1)} ГБ` : `${Math.round(totalMb)} МБ`;
  };

  const enabledCount = browsers.reduce((acc, b) => acc + b.tasks.filter((t) => t.enabled).length, 0);

  const startCleaning = async () => {
    if (cleaning || enabledCount === 0) return;
    setCleaning(true);
    setDone(false);
    setProgress(0);
    setLogs([]);
    let idCounter = 0;

    const activeBrowsers = browsers.filter((b) => b.tasks.some((t) => t.enabled));
    const totalSteps = activeBrowsers.reduce((acc, b) => acc + LOG_MESSAGES[b.id].length, 0);
    let step = 0;

    for (const browser of activeBrowsers) {
      for (const msg of LOG_MESSAGES[browser.id]) {
        await new Promise((r) => setTimeout(r, 320 + Math.random() * 280));
        setLogs((prev) => [...prev, { id: ++idCounter, text: msg.text, type: msg.success ? "success" : "info" }]);
        step++;
        setProgress(Math.round((step / totalSteps) * 100));
      }
    }

    await new Promise((r) => setTimeout(r, 300));
    setProgress(100);
    setTotalFreed(calcTotalMb());
    setDone(true);
    setCleaning(false);
  };

  const reset = () => {
    setDone(false);
    setProgress(0);
    setLogs([]);
    setTotalFreed("0 МБ");
  };

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      {/* Header */}
      <div
        className="max-w-4xl mx-auto mb-8"
        style={{
          opacity: animIn ? 1 : 0,
          transform: animIn ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
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
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
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

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Modules */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {browsers.map((browser, idx) => (
            <div
              key={browser.id}
              className="glass rounded-2xl overflow-hidden"
              style={{
                opacity: animIn ? 1 : 0,
                transform: animIn ? "translateY(0)" : "translateY(24px)",
                transition: `all 0.6s cubic-bezier(0.34,1.56,0.64,1) ${120 + idx * 100}ms`,
              }}
            >
              <div
                className="px-5 py-4 flex items-center gap-3"
                style={{
                  background: `linear-gradient(90deg, rgba(${browser.glowRgb},0.12) 0%, transparent 100%)`,
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${browser.color} flex items-center justify-center shrink-0`}
                  style={{ boxShadow: `0 4px 20px rgba(${browser.glowRgb},0.4)` }}
                >
                  <Icon name={browser.icon} size={20} className="text-white" />
                </div>
                <div>
                  <div className="font-bold text-white">{browser.name}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {browser.tasks.filter((t) => t.enabled).length} из {browser.tasks.length} выбрано
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 flex flex-col gap-2">
                {browser.tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(browser.id, task.id)}
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
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0"
                        style={{
                          border: task.enabled ? "1.5px solid #00d4ff" : "1.5px solid rgba(255,255,255,0.2)",
                          background: task.enabled ? "rgba(0,212,255,0.15)" : "transparent",
                        }}
                      >
                        {task.enabled && <Icon name="Check" size={11} style={{ color: "#00d4ff" }} />}
                      </div>
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>
                        {task.label}
                      </span>
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: task.enabled ? "#00d4ff" : "rgba(255,255,255,0.25)" }}
                    >
                      {task.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Control Panel */}
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div
            className="glass rounded-2xl p-5"
            style={{
              opacity: animIn ? 1 : 0,
              transform: animIn ? "translateY(0)" : "translateY(24px)",
              transition: "all 0.6s cubic-bezier(0.34,1.56,0.64,1) 420ms",
            }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-5"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              Сводка
            </div>

            <div className="text-center mb-5">
              <div
                className="text-5xl font-black leading-none"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: done ? "#00ff88" : "#00d4ff",
                  textShadow: done
                    ? "0 0 40px rgba(0,255,136,0.7)"
                    : "0 0 40px rgba(0,212,255,0.7)",
                  transition: "all 0.6s ease",
                }}
              >
                {done ? totalFreed : calcTotalMb()}
              </div>
              <div className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.38)" }}>
                {done ? "освобождено" : "будет очищено"}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { val: String(enabledCount), label: "задач" },
                { val: String(browsers.length), label: "модулей" },
                { val: `${progress}%`, label: "готово", accent: done },
              ].map(({ val, label, accent }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  <div
                    className="font-bold text-lg"
                    style={{ color: accent ? "#00ff88" : "white" }}
                  >
                    {val}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {(cleaning || done) && (
              <div
                className="h-2 rounded-full mb-5 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.07)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: done
                      ? "linear-gradient(90deg,#00ff88,#00d4ff)"
                      : "linear-gradient(90deg,#00d4ff,#a855f7)",
                    boxShadow: done
                      ? "0 0 12px rgba(0,255,136,0.6)"
                      : "0 0 12px rgba(0,212,255,0.6)",
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
                  background: cleaning || enabledCount === 0
                    ? "rgba(0,212,255,0.08)"
                    : "linear-gradient(135deg,#00d4ff 0%,#a855f7 100%)",
                  color: cleaning || enabledCount === 0 ? "rgba(0,212,255,0.5)" : "#000",
                  boxShadow: cleaning || enabledCount === 0
                    ? "none"
                    : "0 6px 30px rgba(0,212,255,0.4)",
                  border: cleaning || enabledCount === 0
                    ? "1px solid rgba(0,212,255,0.2)"
                    : "none",
                  cursor: cleaning || enabledCount === 0 ? "not-allowed" : "pointer",
                  fontFamily: "'Golos Text', sans-serif",
                  fontWeight: 700,
                }}
              >
                {cleaning ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Очистка...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Zap" size={16} />
                    Начать очистку
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={reset}
                className="w-full py-4 rounded-xl font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg,#00ff88 0%,#00d4ff 100%)",
                  color: "#000",
                  boxShadow: "0 6px 30px rgba(0,255,136,0.4)",
                  cursor: "pointer",
                  fontFamily: "'Golos Text', sans-serif",
                  fontWeight: 700,
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon name="RotateCcw" size={16} />
                  Очистить снова
                </span>
              </button>
            )}
          </div>

          {/* Done banner */}
          {done && (
            <div
              className="glass rounded-2xl p-5 text-center animate-fade-in-up"
              style={{
                border: "1px solid rgba(0,255,136,0.2)",
                background: "rgba(0,255,136,0.04)",
              }}
            >
              <div
                className="text-4xl mb-2 animate-checkmark"
                style={{ display: "block", color: "#00ff88" }}
              >
                ✓
              </div>
              <div className="font-bold text-white text-base">Компьютер очищен!</div>
              <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                Освобождено{" "}
                <span style={{ color: "#00ff88", fontWeight: 700 }}>{totalFreed}</span>
              </div>
            </div>
          )}

          {/* Log */}
          {logs.length > 0 && (
            <div
              className="glass rounded-2xl p-4 animate-fade-in-up"
            >
              <div
                className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: cleaning ? "#00d4ff" : done ? "#00ff88" : "rgba(255,255,255,0.3)",
                    boxShadow: cleaning ? "0 0 8px rgba(0,212,255,0.9)" : "none",
                    animation: cleaning ? "pulse-glow 1.5s ease-in-out infinite" : "none",
                  }}
                />
                Журнал
              </div>
              <div
                ref={logRef}
                className="flex flex-col gap-0.5 overflow-y-auto"
                style={{ maxHeight: "190px" }}
              >
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
                    {log.type === "success" ? "✓ " : "› "}
                    {log.text}
                  </div>
                ))}
                {cleaning && (
                  <div
                    className="text-xs py-1 px-2 animate-pulse"
                    style={{ color: "#00d4ff", fontFamily: "monospace" }}
                  >
                    ▌
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
