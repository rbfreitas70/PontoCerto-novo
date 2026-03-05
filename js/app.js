/* ═══════════════════════════════════════════════════════
   PontoCerto — App Principal (JSX)
   Depende de: constants.js, helpers.js, components.js, tabs.js
   ═══════════════════════════════════════════════════════ */

const App = () => {
    /* ── State ── */
    const [now, setNow] = useState(new Date());
    const [dark, setDark] = useState(false);
    const [tab, setTab] = useState('ponto');
    const [records, setRecs] = useState([]);
    const [user, setUser] = useState({ name: '', email: '' });
    const [editUsr, setEditUsr] = useState(true);
    const [selDate, setSelDate] = useState(null);
    const [notif, setNotif] = useState(null);
    const [editRec, setEditRec] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [manual, setManual] = useState({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5), type: 'entrada', cat: 'normal' });
    const [sal, setSal] = useState({ salary: '', workload: '220', wdPct: '65', wePct: '100' });
    const [editSal, setEditSal] = useState(true);
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [sched, setSched] = useState(DEF_SCH);
    const [editSch, setEditSch] = useState(false);
    const [picked, setPicked] = useState([]);
    const [batch, setBatch] = useState({ start: '07:00', end: '17:00', lunch: 60 });
    const [elapsed, setElapsed] = useState(0);
    const [location, setLocation] = useState(null);

    /* ── Load from LocalStorage ── */
    useEffect(() => {
        const r = safeLS.get('pc_r'), u = safeLS.get('pc_u'), d = safeLS.get('pc_d'), s = safeLS.get('pc_s'), sc = safeLS.get('pc_sc');
        if (r) setRecs(r);
        if (u) { setUser(u); setEditUsr(false); }
        if (d != null) setDark(d);
        if (s) { setSal(s); setEditSal(false); }
        if (sc) setSched({ ...DEF_SCH, ...sc });
    }, []);

    /* ── Clock ── */
    useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

    /* ── Toast ── */
    const toastTimer = useRef(null);
    const toast = useCallback((msg, type = 'info') => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setNotif({ msg, type });
        toastTimer.current = setTimeout(() => { setNotif(null); toastTimer.current = null; }, 3500);
    }, []);

    /* ── Schedule helpers ── */
    const getDaySch = useCallback(date => sched[JS2D[new Date(date).getDay()]] || { active: false, start: '07:00', end: '17:00', lunch: 60 }, [sched]);
    const getExpMin = useCallback(date => { const s = getDaySch(date); return s.active ? Math.max(0, t2m(s.end) - t2m(s.start) - s.lunch) : 0; }, [getDaySch]);

    /* ── Day stats calculator ── */
    const calcDay = useCallback(date => {
        const dateStr = new Date(date).toDateString();
        const dayRecs = records.filter(r => new Date(r.timestamp).toDateString() === dateStr).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const sch = getDaySch(date);
        const expMin = getExpMin(date);

        let normalMin = 0, extraPaidMin = 0, bankMin = 0;
        let normalPairs = [], allPairs = [];

        for (let i = 0; i < dayRecs.length - 1; i++) {
            if (dayRecs[i].type === 'entrada' && dayRecs[i + 1]?.type === 'saida') {
                const dur = (new Date(dayRecs[i + 1].timestamp) - new Date(dayRecs[i].timestamp)) / 60000;
                const cat = dayRecs[i].cat || 'normal';
                const pair = { s: new Date(dayRecs[i].timestamp), e: new Date(dayRecs[i + 1].timestamp), dur, cat };
                allPairs.push(pair);
                if (cat === 'banco') bankMin += dur;
                else if (cat === 'extra') extraPaidMin += dur;
                else { normalMin += dur; normalPairs.push(pair); }
            }
        }

        let workMin = normalMin;
        if (sch.lunch > 0 && normalPairs.length === 1 && normalMin > sch.lunch) workMin -= sch.lunch;

        let extraMin = 0;
        if (sch.active) normalPairs.forEach(p => {
            const sm = p.s.getHours() * 60 + p.s.getMinutes();
            const em = p.e.getHours() * 60 + p.e.getMinutes();
            if (sm < t2m(sch.start)) extraMin += Math.min(t2m(sch.start) - sm, p.dur);
            if (em > t2m(sch.end)) extraMin += Math.min(em - t2m(sch.end), p.dur);
        });

        return {
            workMin: Math.round(workMin), normalMin: Math.round(normalMin),
            extraMin: Math.round(extraMin), extraPaidMin: Math.round(extraPaidMin),
            bankMin: Math.round(bankMin), totalMin: Math.round(normalMin + extraPaidMin + bankMin),
            expMin, balMin: Math.round(workMin - expMin),
            pairs: allPairs.length, normalPairs: normalPairs.length,
            recs: dayRecs, isWorkDay: expMin > 0,
        };
    }, [records, getDaySch, getExpMin]);

    /* ── Elapsed timer ── */
    useEffect(() => {
        const todayStr = new Date().toDateString();
        const todayRecs = records.filter(r => new Date(r.timestamp).toDateString() === todayStr).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        let min = 0;
        for (let i = 0; i < todayRecs.length; i++) {
            if (todayRecs[i].type === 'entrada') {
                if (todayRecs[i + 1]?.type === 'saida') { min += (new Date(todayRecs[i + 1].timestamp) - new Date(todayRecs[i].timestamp)) / 60000; i++; }
                else { min += (new Date() - new Date(todayRecs[i].timestamp)) / 60000; }
            }
        }
        setElapsed(Math.floor(min));
    }, [now, records]);

    /* ── Monthly stats (for Perfil tab) ── */
    const mStats = useMemo(() => {
        const n = new Date(), ms = new Date(n.getFullYear(), n.getMonth(), 1), me = new Date(n.getFullYear(), n.getMonth() + 1, 0);
        let tw = 0, te = 0, tePaid = 0, tb = 0, texp = 0, days = 0;
        for (let d = new Date(ms); d <= me; d.setDate(d.getDate() + 1)) {
            const s = calcDay(d);
            if (s.recs.length) { days++; tw += s.workMin; te += s.extraMin; tePaid += s.extraPaidMin; tb += s.bankMin; }
            if (s.isWorkDay) texp += s.expMin;
        }
        return { tw, te, tePaid, tb, texp, days, bal: tw - texp };
    }, [calcDay]);

    /* ── Calendar grid (memoized) ── */
    const calGrid = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 12 }, (_, m) => {
            const ms = new Date(calYear, m, 1), me = new Date(calYear, m + 1, 0);
            const cells = [];
            for (let i = 0; i < ms.getDay(); i++) cells.push(null);
            for (let d = 1; d <= me.getDate(); d++) {
                const dt = new Date(calYear, m, d), ds = calcDay(dt);
                cells.push({ d, dt, ds, isToday: dt.toDateString() === today.toDateString() });
            }
            return { m, ms, cells };
        });
    }, [calYear, calcDay]);

    /* ── Derived values ── */
    const isWorking = useMemo(() => {
        const todayRecs = records.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString());
        return todayRecs[todayRecs.length - 1]?.type === 'entrada';
    }, [records, now]);

    const todayS = useMemo(() => calcDay(new Date()), [calcDay, now]);
    const todaySch = useMemo(() => getDaySch(new Date()), [getDaySch]);
    const progressPct = useMemo(() => todayS.expMin > 0 ? Math.round((elapsed / todayS.expMin) * 100) : 0, [elapsed, todayS]);

    /* ── Financial ── */
    const extraPay = useMemo(() => {
        if (!sal.salary) return null;
        const sv = parseFloat(sal.salary), wl = parseFloat(sal.workload);
        if (!sv || !wl || sv <= 0 || wl <= 0) return null;
        const hv = sv / wl, hvWd = hv * (1 + parseFloat(sal.wdPct || 0) / 100), hvWe = hv * (1 + parseFloat(sal.wePct || 0) / 100);
        const n = new Date(), ms = new Date(n.getFullYear(), n.getMonth(), 1), me = new Date(n.getFullYear(), n.getMonth() + 1, 0);
        let wdPaidH = 0, wePaidH = 0, wdBankH = 0, weBankH = 0, totalWorkMin = 0;
        for (let d = new Date(ms); d <= me; d.setDate(d.getDate() + 1)) {
            const s = calcDay(d); totalWorkMin += s.workMin;
            const dw = d.getDay(), isWe = dw === 0 || dw === 6;
            const paidH = (s.extraPaidMin + s.extraMin) / 60;
            if (paidH > 0) isWe ? wePaidH += paidH : wdPaidH += paidH;
            const bankH = s.bankMin / 60;
            if (bankH > 0) isWe ? weBankH += bankH : wdBankH += bankH;
        }
        const wdT = wdPaidH * hvWd, weT = wePaidH * hvWe, totalBank = wdBankH + weBankH;
        return { hv, hvWd, hvWe, wdPaidH, wePaidH, wdBankH, weBankH, wdT, weT, totalBank, totalWorkMin, total: wdT + weT };
    }, [sal, calcDay]);

    /* ── Geolocation ── */
    const getLocation = useCallback(() => {
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }), () => { });
    }, []);

    /* ── Record operations ── */
    const punch = type => {
        const r = { id: Date.now(), timestamp: new Date().toISOString(), type, date: new Date().toDateString(), location };
        const upd = [...records, r]; setRecs(upd); safeLS.set('pc_r', upd);
        toast(type === 'entrada' ? '✅ Entrada registrada!' : '✅ Saída registrada!', 'success');
    };

    const addManual = () => {
        if (!manual.date || !manual.time) { toast('⚠️ Preencha todos os campos!', 'error'); return; }
        const ts = new Date(`${manual.date}T${manual.time}:00`);
        if (isNaN(ts)) { toast('⚠️ Data/hora inválida!', 'error'); return; }
        const r = { id: Date.now(), timestamp: ts.toISOString(), type: manual.type, date: ts.toDateString(), manual: true, cat: manual.cat };
        const upd = [...records, r].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setRecs(upd); safeLS.set('pc_r', upd); setShowAdd(false);
        setManual({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0, 5), type: 'entrada', cat: 'normal' });
        toast('✅ Registro adicionado!', 'success');
    };

    const updateRec = (id, ts, type, cat) => {
        const upd = records.map(r => r.id === id ? { ...r, timestamp: ts, type, cat: cat || r.cat || 'normal', date: new Date(ts).toDateString() } : r).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setRecs(upd); safeLS.set('pc_r', upd); setEditRec(null); toast('✅ Registro atualizado!', 'success');
    };

    const deleteRec = id => {
        if (!confirm('Excluir este registro?')) return;
        const upd = records.filter(r => r.id !== id); setRecs(upd); safeLS.set('pc_r', upd); toast('🗑️ Excluído!', 'success');
    };

    const deleteAll = () => {
        if (!confirm('⚠️ Apagar TODOS os registros?')) return;
        if (!confirm('Tem certeza absoluta?')) return;
        setRecs([]); safeLS.set('pc_r', []); toast('🗑️ Tudo apagado!', 'success');
    };

    /* ── Schedule operations ── */
    const saveSch = () => {
        for (const [dk, s] of Object.entries(sched)) { if (s.active && !validateTimeOrder(s.start, s.end)) { toast(`⚠️ Horário inválido em ${DLABEL[dk]}`, 'error'); return; } }
        safeLS.set('pc_sc', sched); setEditSch(false); setPicked([]); toast('⚙️ Jornada salva!', 'success');
    };
    const togglePick = dk => setPicked(p => p.includes(dk) ? p.filter(x => x !== dk) : [...p, dk]);
    const applyBatch = () => {
        if (!picked.length) { toast('⚠️ Selecione ao menos um dia!', 'error'); return; }
        if (!validateTimeOrder(batch.start, batch.end)) { toast('⚠️ Fim deve ser após início!', 'error'); return; }
        setSched(prev => { const n = { ...prev }; picked.forEach(dk => { n[dk] = { ...n[dk], start: batch.start, end: batch.end, lunch: Number(batch.lunch) }; }); return n; });
        toast(`✅ Aplicado a ${picked.length} dia(s)!`, 'success');
    };

    /* ── Theme classes ── */
    const bg = dark ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900';
    const card = dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
    const sub = dark ? 'bg-gray-700' : 'bg-gray-100';
    const bdr = dark ? 'border-gray-600' : 'border-gray-200';
    const inp = dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900';
    const glass = dark ? 'glass glass-dark' : 'glass glass-light';

    /* ── Tab definitions ── */
    const TABS = [
        { id: 'ponto', icon: 'clock', label: 'Ponto' },
        { id: 'calendario', icon: 'cal', label: 'Cal.' },
        { id: 'relatorios', icon: 'file', label: 'Relat.' },
        { id: 'financeiro', icon: 'trend', label: 'Financeiro' },
        { id: 'usuario', icon: 'user', label: 'Perfil' },
    ];

    /* ── Render ── */
    return (
        <ErrorBoundary>
            <div className={`min-h-screen ${bg} transition-colors duration-300`} style={{ paddingBottom: 88 }} id="main-content">
                {/* Toast */}
                {notif && <div className="fixed top-3 inset-x-3 z-50 pointer-events-none" role="alert"><div className={`${dark ? 'bg-gray-700' : 'bg-white'} px-4 py-3 rounded-2xl shadow-xl border-l-4 ${notif.type === 'error' ? 'border-red-500' : 'border-green-500'} text-sm font-semibold text-center`}>{notif.msg}</div></div>}

                {/* Header */}
                <div className={`${card} shadow-sm px-4 pt-4 pb-3`}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center"><Icon name="clock" className="w-5 h-5 text-white" /></div>
                            <div><h1 className="font-extrabold text-base grad-text">PontoCerto</h1><p className="text-xs opacity-40">Controle de Jornada</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={getLocation} className={`p-2 rounded-xl transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`} title="Localização"><Icon name="location" className="w-5 h-5" /></button>
                            <button onClick={() => { const v = !dark; setDark(v); safeLS.set('pc_d', v); }} className={`p-2 rounded-xl transition ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Icon name={dark ? 'sun' : 'moon'} className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="text-center">
                        <time className="mono text-3xl font-bold tracking-tighter">{now.toLocaleTimeString('pt-BR')}</time>
                        <p className="text-xs opacity-50 capitalize mt-0.5">{now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        {todaySch.active ? <p className="text-xs font-semibold text-blue-500 mt-1">⏰ {todaySch.start} – {todaySch.end} · {todaySch.lunch}min almoço</p> : <p className="text-xs text-gray-400 mt-1">📅 Folga hoje</p>}
                    </div>
                </div>

                {/* Navigation */}
                <nav className={`${card} shadow-lg px-3 py-2 sticky top-0 z-30 border-b ${bdr}`}>
                    <div className="flex items-center justify-center gap-1">
                        {TABS.map(x => (
                            <button key={x.id} onClick={() => setTab(x.id)}
                                className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-2xl transition-all duration-200 flex-1 max-w-[70px] ${tab === x.id
                                    ? 'bg-gradient-to-b from-blue-500 to-indigo-600 text-white font-bold shadow-lg scale-105'
                                    : (dark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')}`}>
                                <Icon name={x.icon} className={`transition-all duration-200 ${tab === x.id ? 'w-5 h-5' : 'w-[18px] h-[18px]'}`} />
                                <span className="text-[10px] font-semibold truncate w-full text-center leading-tight mt-0.5">{x.label}</span>
                                {tab === x.id && <span className="w-1 h-1 rounded-full bg-white/80" />}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Content */}
                <main className="p-3 space-y-3">
                    {tab === 'ponto' && <PontoTab {...{ records, isWorking, elapsed, progressPct, todayS, todaySch, punch, setShowAdd, showAdd, manual, setManual, addManual, setEditRec, deleteRec, calcDay, dark, card, sub, bdr, inp, glass }} />}
                    {tab === 'calendario' && <CalendarioTab {...{ calYear, setCalYear, calGrid, selDate, setSelDate, setEditRec, deleteRec, calcDay, dark, card, sub, bdr }} />}
                    {tab === 'relatorios' && <RelatoriosTab {...{ calcDay, sched, sal, user, dark, card, sub, glass, toast }} />}
                    {tab === 'financeiro' && <FinanceiroJornada {...{ card, sub, inp, dark, bdr, sal, setSal, editSal, setEditSal, extraPay, sched, setSched, editSch, setEditSch, picked, setPicked, batch, setBatch, togglePick, applyBatch, saveSch, toast }} />}
                    {tab === 'usuario' && <PerfilTab {...{ user, setUser, editUsr, setEditUsr, records, mStats, deleteAll, dark, card, sub, bdr, inp, toast }} />}
                </main>
            </div>

            {/* Modal Editar Registro */}
            {editRec && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setEditRec(null); }}>
                    <div className={`${card} rounded-2xl shadow-2xl p-5 w-full max-w-sm`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-base flex items-center gap-2"><span className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center"><Icon name="edit" className="w-4 h-4 text-white" /></span>Editar Registro</h3>
                            <button onClick={() => setEditRec(null)} className={`p-1.5 rounded-lg font-bold text-lg leading-none ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>✕</button>
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-xs font-semibold opacity-60 block mb-1">📅 Data e Hora</label><DateTimePicker value={editRec.timestamp} onChange={v => setEditRec({ ...editRec, timestamp: v })} dark={dark} bdr={bdr} /></div>
                            <div><label className="text-xs font-semibold opacity-60 block mb-1">🔄 Tipo</label>
                                <div className="grid grid-cols-2 gap-2">{[{ v: 'entrada', label: '🟢 Entrada' }, { v: 'saida', label: '🔴 Saída' }].map(t => (
                                    <button key={t.v} onClick={() => setEditRec({ ...editRec, type: t.v })} className={`py-3 rounded-xl text-sm font-bold border-2 transition active:scale-95 ${editRec.type === t.v ? 'border-blue-500 bg-blue-50 text-blue-700' : (dark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 text-gray-600')}`}>{t.label}</button>
                                ))}</div>
                            </div>
                            <div><label className="text-xs font-semibold opacity-60 block mb-1">🏷️ Categoria</label>
                                <div className="grid grid-cols-3 gap-2">{[{ v: 'normal', e: '⚪', l: 'Normal' }, { v: 'extra', e: '⏰', l: 'Extra' }, { v: 'banco', e: '🏦', l: 'Banco' }].map(c => (
                                    <button key={c.v} onClick={() => setEditRec({ ...editRec, cat: c.v })} className={`py-3 rounded-xl text-xs font-bold border-2 transition active:scale-95 ${(editRec.cat || 'normal') === c.v ? 'border-blue-500 bg-blue-50 text-blue-700' : (dark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-200 text-gray-600')}`}><span className="text-lg mb-0.5 block">{c.e}</span>{c.l}</button>
                                ))}</div>
                            </div>
                            {editRec.manual && <p className={`text-xs text-center px-3 py-2 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-100'} opacity-60`}>✏️ Registro inserido manualmente</p>}
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => updateRec(editRec.id, editRec.timestamp, editRec.type, editRec.cat)} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold active:scale-95 shadow-lg shadow-green-200">✓ Salvar</button>
                                <button onClick={() => setEditRec(null)} className="flex-1 py-3 bg-gray-400 text-white rounded-xl font-bold active:scale-95">✕ Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ErrorBoundary>
    );
};

/* ── Render ── */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
