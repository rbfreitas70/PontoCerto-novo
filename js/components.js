/* ═══════════════════════════════════════════════════════
   PontoCerto — Componentes Reutilizáveis (JSX)
   Depende de: constants.js, helpers.js
   ═══════════════════════════════════════════════════════ */

const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ─── Error Boundary ─── */
class ErrorBoundary extends React.Component {
    constructor(p) { super(p); this.state = { hasError: false, error: null }; }
    static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
    render() {
        if (this.state.hasError) return (
            <div className="p-4 bg-red-100 text-red-800 rounded-xl">
                <h2 className="font-bold mb-2">Algo deu errado</h2>
                <p className="text-sm">{this.state.error?.message}</p>
                <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-xl">Recarregar</button>
            </div>
        );
        return this.props.children;
    }
}

/* ─── Ícones SVG ─── */
const ICON_PATHS = {
    clock: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
    play: <polygon points="5 3 19 12 5 21 5 3" />,
    stop: <rect x="3" y="3" width="18" height="18" rx="2" />,
    cal: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    sun: <><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></>,
    moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    chevL: <polyline points="15 18 9 12 15 6" />,
    chevR: <polyline points="9 18 15 12 9 6" />,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    trend: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    location: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    bank: <><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" /></>,
};

const Icon = ({ name, className = "w-5 h-5" }) => {
    const d = ICON_PATHS[name];
    if (!d) return null;
    return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">{d}</svg>;
};

/* ─── Progress Ring (anel de progresso) ─── */
const ProgressRing = ({ percent, size = 120, stroke = 8, children, working }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const p = Math.min(Math.max(percent, 0), 100);
    const offset = circ - (p / 100) * circ;
    const color = p >= 100 ? '#22c55e' : p >= 75 ? '#3b82f6' : p >= 50 ? '#eab308' : '#ef4444';
    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className={working ? 'ring-active' : ''}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="opacity-10" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className="progress-ring-circle" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
        </div>
    );
};

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon, gradient, extra }) => (
    <div className={`stat-card p-3 rounded-2xl text-center text-white bg-gradient-to-br ${gradient} shadow-lg`}>
        <div className="flex items-center justify-center gap-1 mb-1 opacity-80">
            {icon && <span className="text-sm">{icon}</span>}
            <span className="text-xs font-semibold">{label}</span>
        </div>
        <p className="mono font-extrabold text-xl count-anim">{value}</p>
        {extra && <p className="text-xs opacity-70 mt-0.5">{extra}</p>}
    </div>
);

/* ─── WeekBarChart (gráfico de barras da semana) ─── */
const WeekBarChart = ({ calcDay, dark }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const data = useMemo(() => {
        const today = new Date();
        const dow = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dow + 6) % 7));

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const s = calcDay(d);
            const isFuture = d > today;
            return {
                day: DSHORT[DAYS[i]],
                normal: isFuture ? 0 : Math.round(s.workMin / 60 * 100) / 100,
                extra: isFuture ? 0 : Math.round((s.extraPaidMin + s.extraMin) / 60 * 100) / 100,
                banco: isFuture ? 0 : Math.round(s.bankMin / 60 * 100) / 100,
                expected: Math.round(s.expMin / 60 * 100) / 100,
                isToday: d.toDateString() === today.toDateString(),
            };
        });
    }, [calcDay]);

    useEffect(() => {
        if (!canvasRef.current) return;
        if (chartRef.current) { try { chartRef.current.destroy(); } catch (e) { } chartRef.current = null; }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        const gridColor = dark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)';
        const tickColor = dark ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.5)';

        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.day),
                datasets: [
                    { label: 'Esperado', data: data.map(d => d.expected), type: 'line', borderColor: dark ? 'rgba(148,163,184,.6)' : 'rgba(100,116,139,.5)', borderWidth: 1.5, borderDash: [4, 3], pointRadius: 0, fill: false, tension: 0, order: 0 },
                    { label: 'Normal', data: data.map(d => d.normal), backgroundColor: data.map(d => d.isToday ? 'rgba(59,130,246,.9)' : 'rgba(59,130,246,.65)'), borderRadius: 4, borderSkipped: false, stack: 'horas', order: 1 },
                    { label: 'Extra paga', data: data.map(d => d.extra), backgroundColor: data.map(d => d.isToday ? 'rgba(245,158,11,.95)' : 'rgba(245,158,11,.75)'), borderRadius: 4, borderSkipped: false, stack: 'horas', order: 2 },
                    { label: 'Banco', data: data.map(d => d.banco), backgroundColor: data.map(d => d.isToday ? 'rgba(139,92,246,.95)' : 'rgba(139,92,246,.7)'), borderRadius: 4, borderSkipped: false, stack: 'horas', order: 3 },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { display: true, position: 'bottom', labels: { color: tickColor, font: { size: 10, family: 'Sora,sans-serif' }, boxWidth: 10, boxHeight: 10, borderRadius: 3, padding: 10, usePointStyle: true, pointStyle: 'rectRounded', filter: item => item.text !== 'Esperado' } },
                    tooltip: {
                        backgroundColor: dark ? '#1e293b' : '#fff', borderColor: dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)', borderWidth: 1, titleColor: dark ? '#f1f5f9' : '#0f172a', bodyColor: dark ? '#94a3b8' : '#475569', padding: 10,
                        callbacks: { label: ctx => { const v = ctx.parsed.y; if (v <= 0) return null; const h = Math.floor(v); const m = Math.round((v - h) * 60); return ` ${ctx.dataset.label}: ${h}h${m > 0 ? m + 'm' : ''}`; } }
                    }
                },
                scales: {
                    x: { stacked: true, grid: { display: false }, ticks: { color: data.map(d => d.isToday ? (dark ? '#60a5fa' : '#3b82f6') : tickColor), font: ctx => ({ size: 11, weight: data[ctx.index]?.isToday ? '700' : '400', family: 'Sora,sans-serif' }) } },
                    y: { stacked: true, beginAtZero: true, grid: { color: gridColor }, border: { dash: [4, 3] }, ticks: { color: tickColor, font: { size: 10, family: 'JetBrains Mono,monospace' }, stepSize: 2, callback: v => v > 0 ? `${v}h` : '0', maxTicksLimit: 5 } }
                }
            }
        });

        return () => { if (chartRef.current) { try { chartRef.current.destroy(); } catch (e) { } chartRef.current = null; } };
    }, [data, dark]);

    return <div className="h-44 w-full"><canvas ref={canvasRef} /></div>;
};

/* ─── DayTimeline (barra visual do dia) ─── */
const DayTimeline = ({ records, sched, dark }) => {
    if (!records.length) return null;
    const startMin = t2m(sched.start) - 30;
    const endMin = t2m(sched.end) + 30;
    const totalSpan = Math.max(endMin - startMin, 60);
    const segments = [];
    const sorted = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].type === 'entrada') {
            const s = new Date(sorted[i].timestamp);
            const e = sorted[i + 1]?.type === 'saida' ? new Date(sorted[i + 1].timestamp) : new Date();
            const sm = s.getHours() * 60 + s.getMinutes();
            const em = e.getHours() * 60 + e.getMinutes();
            const isExtra = sm < t2m(sched.start) || em > t2m(sched.end);
            segments.push({ left: Math.max(0, ((sm - startMin) / totalSpan) * 100), width: Math.max(2, ((em - sm) / totalSpan) * 100), isExtra });
            if (sorted[i + 1]?.type === 'saida') i++;
        }
    }

    return (
        <div className="space-y-1">
            <div className={`timeline-bar ${dark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                {segments.map((seg, i) => (
                    <div key={i} className={`timeline-segment ${seg.isExtra ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}
                        style={{ left: `${seg.left}%`, width: `${seg.width}%` }} />
                ))}
            </div>
            <div className="flex justify-between text-xs opacity-40 mono">
                <span>{sched.start}</span><span>{sched.end}</span>
            </div>
        </div>
    );
};

/* ─── HoursChart (gráfico de linhas) ─── */
const HoursChart = ({ data, dark }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !data?.length) return;
        if (chartRef.current) { try { chartRef.current.destroy(); } catch (e) { } chartRef.current = null; }

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        chartRef.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Horas', data: data.map(d => d.hours),
                    borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,.1)',
                    tension: .4, fill: true, pointBackgroundColor: '#3B82F6', pointRadius: 4
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: dark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.1)' }, ticks: { color: dark ? '#fff' : '#000' } },
                    x: { grid: { display: false }, ticks: { color: dark ? '#fff' : '#000', maxRotation: 45, minRotation: 45 } }
                }
            }
        });

        return () => { if (chartRef.current) { try { chartRef.current.destroy(); } catch (e) { } chartRef.current = null; } };
    }, [data, dark]);

    return <div className="h-48 w-full"><canvas ref={canvasRef} /></div>;
};

/* ─── TimePicker ─── */
const TimePicker = ({ value, onChange, dark, bdr, label, id }) => {
    const parts = (value || '00:00').split(':');
    const hh = parts[0] || '00';
    const mm = parts[1] || '00';
    const base = `tsel py-2.5 rounded-xl border-2 ${bdr} text-sm w-full ${dark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`;

    return (
        <div>
            {label && <label htmlFor={id} className="block text-xs font-semibold opacity-50 mb-1 text-center">{label}</label>}
            <div className="flex items-center gap-1">
                <select id={id} value={hh} onChange={e => onChange(`${e.target.value}:${mm}`)} className={base}>
                    {HH.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="font-black opacity-50 text-lg">:</span>
                <select value={mm} onChange={e => onChange(`${hh}:${e.target.value}`)} className={base}>
                    {MM_ARR.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
        </div>
    );
};

/* ─── DateTimePicker ─── */
const DateTimePicker = ({ value, onChange, dark, bdr }) => {
    const dt = new Date(value);
    const year = String(dt.getFullYear());
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mm = String(dt.getMinutes()).padStart(2, '0');

    const daysInMonth = new Date(Number(year), Number(month), 0).getDate();
    const DAYS_ARR = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));

    const emit = (y, mo, d, h, mi) => {
        try { onChange(new Date(`${y}-${mo}-${d}T${h}:${mi}:00`).toISOString()); } catch (e) { }
    };

    const sel = `tsel py-2 rounded-xl border-2 ${bdr} text-sm font-bold text-center ${dark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`;

    return (
        <div className="space-y-2">
            <div className="flex gap-1 items-center">
                <select value={day} onChange={e => emit(year, month, e.target.value, hh, mm)} className={`${sel} flex-1`}>{DAYS_ARR.map(d => <option key={d} value={d}>{d}</option>)}</select>
                <select value={month} onChange={e => emit(year, e.target.value, day, hh, mm)} className={`${sel} flex-1`}>{MONTHS.map((m, i) => <option key={m} value={m}>{MNAMES[i]}</option>)}</select>
                <select value={year} onChange={e => emit(e.target.value, month, day, hh, mm)} className={`${sel} flex-1`}>{YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}</select>
            </div>
            <div className="flex items-center gap-1">
                <select value={hh} onChange={e => emit(year, month, day, e.target.value, mm)} className={`${sel} flex-1`}>{HH.map(h => <option key={h} value={h}>{h}</option>)}</select>
                <span className="font-black opacity-50 text-lg">:</span>
                <select value={mm} onChange={e => emit(year, month, day, hh, e.target.value)} className={`${sel} flex-1`}>{MM_ARR.map(m => <option key={m} value={m}>{m}</option>)}</select>
            </div>
        </div>
    );
};
