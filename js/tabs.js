/* ═══════════════════════════════════════════════════════
   PontoCerto — Componentes de Abas (JSX)
   ═══════════════════════════════════════════════════════ */

/* ─── RecordRow (linha de registro reutilizável) ─── */
const RecordRow = ({ rec, onEdit, onDelete, compact }) => {
    const isBanco = rec.cat === 'banco';
    const isEntrada = rec.type === 'entrada';
    const bg = isBanco ? 'bg-purple-50 text-purple-800' : isEntrada ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800';
    const icon = isBanco ? '🏦' : isEntrada ? '🟢' : '🔴';
    const label = isEntrada ? 'Entrada' : 'Saída';
    const sz = compact ? 'p-2 text-xs' : 'p-2.5 text-sm';
    const btnSz = compact ? 'p-1.5' : 'p-2';
    const iconSz = compact ? 'w-3 h-3' : 'w-3.5 h-3.5';

    return (
        <div className={`flex items-center justify-between rounded-xl ${bg} ${sz}`}>
            <div>
                <div className="font-bold flex items-center gap-1">
                    {icon} {label}
                    {rec.manual && <span className="text-xs opacity-50">(manual)</span>}
                    {rec.cat === 'extra' && <span className="text-xs px-1.5 py-0.5 bg-yellow-500 text-white rounded-full badge-extra">Extra</span>}
                </div>
                <time className="mono font-bold">{new Date(rec.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</time>
            </div>
            <div className="flex gap-1">
                <button onClick={() => onEdit(rec)} className={`${btnSz} bg-blue-500 text-white rounded-xl active:scale-90`}><Icon name="edit" className={iconSz} /></button>
                <button onClick={() => onDelete(rec.id)} className={`${btnSz} bg-red-500 text-white rounded-xl active:scale-90`}><Icon name="trash" className={iconSz} /></button>
            </div>
        </div>
    );
};

/* ═══════════════ ABA PONTO ═══════════════ */
const PontoTab = ({ records, isWorking, elapsed, progressPct, todayS, todaySch, punch, setShowAdd, showAdd, manual, setManual, addManual, setEditRec, deleteRec, calcDay, dark, card, sub, bdr, inp, glass }) => (
    <div className="space-y-3">
        {/* Progresso + botões */}
        <section className={`${card} rounded-2xl shadow p-4`}>
            <div className="flex flex-col items-center mb-4">
                <ProgressRing percent={progressPct} size={140} stroke={10} working={isWorking}>
                    <p className="mono text-2xl font-extrabold text-blue-600 count-anim">{fmtMin(elapsed)}</p>
                    <p className="text-xs opacity-50">{progressPct}%</p>
                </ProgressRing>
                <div className={`mt-2 py-1.5 px-4 rounded-full text-xs font-bold ${isWorking ? 'bg-green-100 text-green-700 pulse-w' : 'bg-gray-100 text-gray-500'}`}>
                    {isWorking ? '🟢 Trabalhando' : '⚪ Fora do expediente'}
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <button onClick={() => punch('entrada')} disabled={isWorking} className={`p-4 rounded-2xl text-white font-bold flex flex-col items-center gap-1.5 transition-all ${isWorking ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-br from-emerald-400 to-green-600 active:scale-95 shadow-lg shadow-green-200'}`}><Icon name="play" className="w-7 h-7" /><span className="text-sm">Iniciar</span></button>
                <button onClick={() => punch('saida')} disabled={!isWorking} className={`p-4 rounded-2xl text-white font-bold flex flex-col items-center gap-1.5 transition-all ${!isWorking ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-br from-red-400 to-rose-600 active:scale-95 shadow-lg shadow-red-200'}`}><Icon name="stop" className="w-7 h-7" /><span className="text-sm">Encerrar</span></button>
            </div>
            {todayS.recs.length > 0 && <DayTimeline records={todayS.recs} sched={todaySch} dark={dark} />}
        </section>

        {/* Stats do dia */}
        <div className="grid grid-cols-2 gap-2">
            <StatCard label="Trabalhadas" value={fmtMin(todayS.workMin)} icon="⏱" gradient="from-blue-500 to-blue-600" />
            <StatCard label="Esperadas" value={fmtMin(todayS.expMin)} icon="🎯" gradient="from-emerald-500 to-green-600" />
            <StatCard label="Extra paga" value={fmtMin(todayS.extraMin + todayS.extraPaidMin)} icon="⚡" gradient="from-amber-400 to-yellow-500" extra={(todayS.extraMin + todayS.extraPaidMin) > 0 ? <span className="badge-extra inline-block">ativo</span> : null} />
            <StatCard label="Banco" value={fmtMin(todayS.bankMin)} icon="🏦" gradient="from-purple-500 to-violet-600" />
        </div>

        {/* Saldo do dia */}
        <div className={`p-3 rounded-2xl text-center font-bold ${todayS.balMin >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} ${glass}`}>
            <span className="text-sm">Saldo Hoje: </span><span className="mono text-xl">{todayS.balMin >= 0 ? '+' : ''}{fmtMin(todayS.balMin)}</span>
            {elapsed >= todayS.expMin && todayS.expMin > 0 && <span className="ml-2">✅</span>}
        </div>

        {/* Gráfico semanal */}
        <section className={`${card} rounded-2xl shadow p-4`}>
            <h2 className="font-bold text-sm mb-3">📊 Semana Atual</h2>
            <WeekBarChart calcDay={calcDay} dark={dark} />
        </section>

        {/* Registros do dia */}
        <section className={`${card} rounded-2xl shadow p-4`}>
            <div className="flex justify-between items-center mb-3">
                <h2 className="font-bold text-sm">Registros de Hoje</h2>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-500 text-white rounded-xl font-bold active:scale-95"><Icon name="plus" className="w-3 h-3" />Adicionar</button>
            </div>

            {/* Modal adicionar */}
            {showAdd && <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 p-4">
                <div className={`${card} rounded-2xl shadow-2xl p-5 w-full max-w-sm`}>
                    <h3 className="font-bold text-base mb-4">Adicionar Registro</h3>
                    <div className="space-y-3">
                        <div><label className="text-xs font-semibold opacity-60 block mb-1">Data e Hora</label>
                            <DateTimePicker value={new Date(`${manual.date}T${manual.time}:00`).toISOString()} onChange={v => { const dt = new Date(v); setManual({ ...manual, date: dt.toISOString().split('T')[0], time: `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}` }); }} dark={dark} bdr={bdr} />
                        </div>
                        <div><label className="text-xs font-semibold opacity-60 block mb-1">Tipo</label>
                            <select value={manual.type} onChange={e => setManual({ ...manual, type: e.target.value })} className={`w-full p-3 rounded-xl border ${inp} text-sm font-semibold`}><option value="entrada">🟢 Entrada</option><option value="saida">🔴 Saída</option></select>
                        </div>
                        <div><label className="text-xs font-semibold opacity-60 block mb-2">Categoria</label>
                            <div className="grid grid-cols-3 gap-2">{[{ v: 'normal', e: '⚪', l: 'Normal' }, { v: 'extra', e: '⏰', l: 'Extra' }, { v: 'banco', e: '🏦', l: 'Banco' }].map(c => (
                                <button key={c.v} onClick={() => setManual({ ...manual, cat: c.v })} className={`py-3 rounded-xl text-xs font-bold border-2 transition active:scale-95 ${manual.cat === c.v ? 'border-blue-500 bg-blue-50 text-blue-700' : `border-gray-200 ${dark ? 'border-gray-600 bg-gray-700' : ''}`}`}><span className="text-lg mb-0.5 block">{c.e}</span>{c.l}</button>
                            ))}</div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button onClick={addManual} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold active:scale-95">✓ Adicionar</button>
                            <button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-gray-400 text-white rounded-xl font-bold active:scale-95">✕ Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>}

            {/* Lista separada: Normal + Banco */}
            {(() => {
                const todayStr = new Date().toDateString();
                const todayAll = records.filter(r => new Date(r.timestamp).toDateString() === todayStr).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                const normal = todayAll.filter(r => (r.cat || 'normal') !== 'banco');
                const banco = todayAll.filter(r => r.cat === 'banco');
                return <div className="space-y-3">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1.5">⏱ Jornada / Extra paga</p>
                        <div className="space-y-2 max-h-52 overflow-y-auto no-sb">
                            {normal.length > 0 ? normal.map(rec => <RecordRow key={rec.id} rec={rec} onEdit={setEditRec} onDelete={deleteRec} />) : <p className="text-center opacity-30 py-3 text-xs">Nenhum registro</p>}
                        </div>
                    </div>
                    <div className={`rounded-2xl p-3 border-2 border-dashed ${dark ? 'border-purple-800 bg-purple-950/20' : 'border-purple-200 bg-purple-50/50'}`}>
                        <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1.5">🏦 Banco de Horas</p>
                        <div className="space-y-2 max-h-36 overflow-y-auto no-sb">
                            {banco.length > 0 ? banco.map(rec => <RecordRow key={rec.id} rec={rec} onEdit={setEditRec} onDelete={deleteRec} />) : <p className="text-center text-purple-400 opacity-50 py-2 text-xs">Nenhum registro de banco hoje</p>}
                        </div>
                    </div>
                </div>;
            })()}
        </section>
    </div>
);

/* ═══════════════ ABA CALENDÁRIO ═══════════════ */
const CalendarioTab = ({ calYear, setCalYear, calGrid, selDate, setSelDate, setEditRec, deleteRec, calcDay, dark, card, sub, bdr }) => (
    <div className="space-y-3">
        <section className={`${card} rounded-2xl shadow p-4`}>
            <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-sm">📅 Calendário Anual</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCalYear(calYear - 1)} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Icon name="chevL" className="w-4 h-4" /></button>
                    <span className="font-bold mono">{calYear}</span>
                    <button onClick={() => setCalYear(calYear + 1)} className={`p-1.5 rounded-lg ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}><Icon name="chevR" className="w-4 h-4" /></button>
                </div>
            </div>
            <div className="flex gap-3 flex-wrap mb-3 text-xs">
                {[['bg-blue-300', 'Normal'], ['bg-yellow-300', 'Extras'], ['bg-purple-300', 'Banco'], ['bg-gray-200', 'Vazio']].map(([c, l]) => <div key={l} className="flex items-center gap-1"><div className={`w-3 h-3 rounded ${c}`} /><span className="opacity-60">{l}</span></div>)}
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[65vh] overflow-y-auto no-sb">
                {calGrid.map(({ m, ms, cells }) => (
                    <div key={m} className={`mc p-3 rounded-xl shadow ${dark ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="font-bold text-xs text-center capitalize mb-2">{ms.toLocaleDateString('pt-BR', { month: 'long' })} {calYear}</div>
                        <div className="grid grid-cols-7 gap-0.5 mb-1">{'DSTQQSS'.split('').map((d, i) => <div key={i} className="text-center text-xs opacity-40 font-bold">{d}</div>)}</div>
                        <div className="grid grid-cols-7 gap-0.5">
                            {cells.map((cell, i) => {
                                if (!cell) return <div key={`e${i}`} />;
                                const { d, dt, ds, isToday } = cell;
                                const hasR = ds.recs.length > 0;
                                let cls = 'cal-day aspect-square flex items-center justify-center text-xs rounded-lg ';
                                if (!hasR) cls += dark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400';
                                else if (ds.extraMin > 0) cls += 'cal-e';
                                else if (ds.pairs >= 2) cls += 'cal-b';
                                else cls += 'cal-n';
                                if (isToday) cls += ' cal-t';
                                return <button key={d} onClick={() => hasR && setSelDate(dt)} className={cls} disabled={!hasR}>{d}</button>;
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Detalhe do dia selecionado */}
        {selDate && (() => {
            const ds = calcDay(selDate);
            const normal = ds.recs.filter(r => (r.cat || 'normal') !== 'banco');
            const banco = ds.recs.filter(r => r.cat === 'banco');
            return (
                <section className={`${card} rounded-2xl shadow p-4`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-sm capitalize">{selDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
                        <button onClick={() => setSelDate(null)} className="text-red-500 p-1.5 rounded-lg font-bold">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {[{ l: 'Trabalhadas', v: fmtMin(ds.workMin), c: 'bg-blue-100 text-blue-800' }, { l: 'Esperadas', v: fmtMin(ds.expMin), c: 'bg-green-100 text-green-800' }, { l: 'Extra paga', v: fmtMin(ds.extraPaidMin + ds.extraMin), c: 'bg-amber-100 text-amber-800' }, { l: 'Banco 🏦', v: fmtMin(ds.bankMin), c: 'bg-purple-100 text-purple-800' }].map(x => <div key={x.l} className={`p-2 rounded-xl text-center ${x.c}`}><p className="mono font-bold">{x.v}</p><p className="text-xs opacity-70">{x.l}</p></div>)}
                    </div>
                    <div className={`mb-2 p-2 rounded-xl text-center text-sm font-bold ${ds.balMin >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Saldo: {ds.balMin >= 0 ? '+' : ''}{fmtMin(ds.balMin)}</div>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-1">⏱ Jornada / Extra paga</p>
                            <div className="space-y-1">{normal.length > 0 ? normal.map(rec => <RecordRow key={rec.id} rec={rec} onEdit={setEditRec} onDelete={deleteRec} compact />) : <p className="text-center opacity-30 py-2 text-xs">Nenhum</p>}</div>
                        </div>
                        {banco.length > 0 && <div className={`rounded-xl p-2 border border-dashed ${dark ? 'border-purple-700 bg-purple-950/20' : 'border-purple-300 bg-purple-50'}`}>
                            <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-1">🏦 Banco de Horas</p>
                            <div className="space-y-1">{banco.map(rec => <RecordRow key={rec.id} rec={rec} onEdit={setEditRec} onDelete={deleteRec} compact />)}</div>
                        </div>}
                    </div>
                </section>
            );
        })()}
    </div>
);

/* ═══════════════ ABA RELATÓRIOS (com seletor de mês/ano) ═══════════════ */
const RelatoriosTab = ({ calcDay, sched, sal, user, dark, card, sub, glass, toast }) => {
    const [rptMonth, setRptMonth] = useState(new Date().getMonth());
    const [rptYear, setRptYear] = useState(new Date().getFullYear());

    /* Stats do mês/ano selecionado */
    const rptStats = useMemo(() => {
        const ms = new Date(rptYear, rptMonth, 1);
        const me = new Date(rptYear, rptMonth + 1, 0);
        let tw = 0, te = 0, tePaid = 0, tb = 0, texp = 0, days = 0;
        const worked = [];
        for (let d = new Date(ms); d <= me; d.setDate(d.getDate() + 1)) {
            const s = calcDay(d);
            if (s.recs.length) { days++; tw += s.workMin; te += s.extraMin; tePaid += s.extraPaidMin; tb += s.bankMin; worked.push({ date: new Date(d), s }); }
            if (s.isWorkDay) texp += s.expMin;
        }
        return { tw, te, tePaid, tb, texp, days, bal: tw - texp, worked };
    }, [calcDay, rptMonth, rptYear]);

    /* Dados para gráfico */
    const chartData = useMemo(() => rptStats.worked.map(({ date, s }) => ({
        date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        hours: s.workMin / 60
    })), [rptStats]);

    /* Exportar relatório */
    const exportRpt = (format) => {
        const ms = new Date(rptYear, rptMonth, 1);
        const me = new Date(rptYear, rptMonth + 1, 0);
        const mesAno = ms.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const filename = `pontocerto-${rptYear}-${String(rptMonth + 1).padStart(2, '0')}`;
        const fmt = d => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const fmtDate = d => new Date(d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
        const sv = parseFloat(sal.salary || 0), wl = parseFloat(sal.workload || 220);
        const hv = sv > 0 && wl > 0 ? sv / wl : 0;
        const hvWd = hv * (1 + parseFloat(sal.wdPct || 50) / 100);
        let out = '';

        if (format === 'txt') {
            const sep = '═'.repeat(58), line = '─'.repeat(58);
            out += `${sep}\n  PONTOCERTO — RELATÓRIO MENSAL DETALHADO\n${sep}\n`;
            out += `  Colaborador : ${user.name || 'Não informado'}\n  Período     : ${mesAno.toUpperCase()}\n  Gerado em   : ${new Date().toLocaleString('pt-BR')}\n${sep}\n\n`;
            out += `JORNADA CONFIGURADA\n${line}\n`;
            DAYS.forEach(dk => { const s = sched[dk]; out += s.active ? `  ${DLABEL[dk].padEnd(12)}: ${s.start} – ${s.end}  |  Almoço: ${s.lunch}min  |  Jornada: ${fmtMin(Math.max(0, t2m(s.end) - t2m(s.start) - s.lunch))}\n` : `  ${DLABEL[dk].padEnd(12)}: FOLGA\n`; });
            out += `\nREGISTROS DIÁRIOS\n${line}\n`;
            rptStats.worked.forEach(({ date, s }) => {
                out += `\n  ${fmtDate(date).toUpperCase()}\n`;
                if (!s.recs.length) out += '    (sem registros)\n';
                else s.recs.forEach(r => { out += `    ${r.type === 'entrada' ? '→ ENTRADA' : '← SAÍDA  '}  ${fmt(r.timestamp)}${r.cat && r.cat !== 'normal' ? ` [${r.cat.toUpperCase()}]` : ''}${r.manual ? ' (manual)' : ''}\n`; });
                out += `    ${'-'.repeat(40)}\n    Trabalhado : ${fmtMin(s.workMin).padEnd(10)} Esperado: ${fmtMin(s.expMin)}\n    Saldo      : ${(s.balMin >= 0 ? '+' : '') + fmtMin(s.balMin).padEnd(10)}`;
                if (s.extraPaidMin + s.extraMin > 0) out += ` Extra paga: ${fmtMin(s.extraPaidMin + s.extraMin)}`;
                if (s.bankMin > 0) out += ` Banco: ${fmtMin(s.bankMin)}`;
                out += '\n';
            });
            out += `\n${sep}\nRESUMO DO MÊS\n${line}\n  Dias com registro : ${rptStats.days}\n  Horas trabalhadas : ${fmtMin(rptStats.tw)}\n  Horas esperadas   : ${fmtMin(rptStats.texp)}\n  Saldo total       : ${(rptStats.bal >= 0 ? '+' : '') + fmtMin(rptStats.bal)}\n\nHORAS EXTRAS\n${line}\n  Extras remuneradas: ${fmtMin(rptStats.te + rptStats.tePaid)}\n  Banco de horas    : ${fmtMin(rptStats.tb)}  (não remunerado)\n`;
            if (sv > 0) { const ve = ((rptStats.te + rptStats.tePaid) / 60) * hvWd; out += `\nCÁLCULO FINANCEIRO\n${line}\n  Salário base      : R$ ${sv.toFixed(2)}\n  Valor hora normal : R$ ${hv.toFixed(2)}\n  Valor hora extra  : R$ ${hvWd.toFixed(2)} (${sal.wdPct}%)\n  Extras a receber  : R$ ${ve.toFixed(2)}\n  TOTAL DO MÊS      : R$ ${(sv + ve).toFixed(2)}\n`; }
            out += `\n${sep}\n  Relatório gerado pelo PontoCerto v2.0\n${sep}\n`;
        } else {
            out += `PONTOCERTO - RELATÓRIO MENSAL;${mesAno.toUpperCase()};;;;;;\nColaborador;${user.name || 'Não informado'};;;;;;\nGerado em;${new Date().toLocaleString('pt-BR')};;;;;;\n;;;;;;\n`;
            out += `DATA;DIA DA SEMANA;TIPO;HORÁRIO;CATEGORIA;ORIGEM;\n`;
            rptStats.worked.forEach(({ date, s }) => {
                if (!s.recs.length) out += `${date.toLocaleDateString('pt-BR')};${date.toLocaleDateString('pt-BR', { weekday: 'long' })};-;-;-;-;\n`;
                else s.recs.forEach(r => { out += `${date.toLocaleDateString('pt-BR')};${date.toLocaleDateString('pt-BR', { weekday: 'long' })};${r.type === 'entrada' ? 'Entrada' : 'Saída'};${fmt(r.timestamp)};${r.cat || 'normal'};${r.manual ? 'Manual' : 'Automático'};\n`; });
            });
            out += `;;;;;;\nRESUMO POR DIA;;;;;;\nDATA;DIA;TRABALHADO;ESPERADO;SALDO;EXTRA PAGA;BANCO;\n`;
            rptStats.worked.forEach(({ date, s }) => { out += `${date.toLocaleDateString('pt-BR')};${date.toLocaleDateString('pt-BR', { weekday: 'short' })};${fmtMin(s.workMin)};${fmtMin(s.expMin)};${(s.balMin >= 0 ? '+' : '') + fmtMin(s.balMin)};${(s.extraPaidMin + s.extraMin) > 0 ? fmtMin(s.extraPaidMin + s.extraMin) : '-'};${s.bankMin > 0 ? fmtMin(s.bankMin) : '-'};\n`; });
            out += `;;;;;;\nTOTAIS DO MÊS;;;;;;\nTotal trabalhado;${fmtMin(rptStats.tw)};;;;;\nTotal esperado;${fmtMin(rptStats.texp)};;;;;\nSaldo;${(rptStats.bal >= 0 ? '+' : '') + fmtMin(rptStats.bal)};;;;;\nExtras remuneradas;${fmtMin(rptStats.te + rptStats.tePaid)};;;;;\nBanco de horas;${fmtMin(rptStats.tb)};;;;;\n`;
            if (sv > 0) { const ve = ((rptStats.te + rptStats.tePaid) / 60) * hvWd; out += `;;;;;;\nFINANCEIRO;;;;;;\nSalário base;R$ ${sv.toFixed(2)};;;;;\nExtras a receber;R$ ${ve.toFixed(2)};;;;;\nTotal do mês;R$ ${(sv + ve).toFixed(2)};;;;;\n`; }
        }
        const blob = new Blob([out], { type: format === 'txt' ? 'text/plain;charset=utf-8' : 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${filename}.${format}`; a.click(); URL.revokeObjectURL(url);
        toast(`📄 Relatório exportado como ${format.toUpperCase()}!`, 'success');
    };

    const selBase = `tsel py-2.5 rounded-xl border-2 text-sm font-bold ${dark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`;

    return (
        <div className="space-y-3">
            <section className={`${card} rounded-2xl shadow p-4`}>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold text-sm flex items-center gap-2"><Icon name="trend" className="w-4 h-4" />Relatório Mensal</h2>
                    <div className="flex gap-2">
                        <button onClick={() => exportRpt('txt')} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-xl text-xs font-bold active:scale-95"><Icon name="download" className="w-3.5 h-3.5" />TXT</button>
                        <button onClick={() => exportRpt('csv')} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-xl text-xs font-bold active:scale-95"><Icon name="download" className="w-3.5 h-3.5" />CSV</button>
                    </div>
                </div>

                {/* ★ Seletor de Mês/Ano ★ */}
                <div className={`flex items-center gap-2 p-3 rounded-2xl mb-4 ${dark ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                    <span className="text-sm">📅</span>
                    <select value={rptMonth} onChange={e => setRptMonth(Number(e.target.value))} className={`${selBase} flex-1`}>
                        {MNAMES_FULL.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select value={rptYear} onChange={e => setRptYear(Number(e.target.value))} className={`${selBase} w-24`}>
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                {chartData.length > 0 && <div className="mb-4"><h3 className="text-xs font-semibold opacity-60 mb-2">Dias trabalhados — {MNAMES_FULL[rptMonth]} {rptYear}</h3><HoursChart data={chartData} dark={dark} /></div>}

                <div className="mb-4">
                    <div className="flex justify-between text-xs font-semibold mb-1"><span>Progresso Mensal</span><span className="mono">{fmtMin(rptStats.tw)} / {fmtMin(rptStats.texp)}</span></div>
                    <div className={`w-full h-3 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                        <div className={`h-full rounded-full transition-all duration-500 ${rptStats.bal >= 0 ? 'bg-gradient-to-r from-green-400 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-rose-500'}`} style={{ width: `${Math.min(100, rptStats.texp > 0 ? (rptStats.tw / rptStats.texp) * 100 : 0)}%` }} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <StatCard label="Trabalhado" value={fmtMin(rptStats.tw)} gradient="from-blue-500 to-blue-600" />
                    <StatCard label="Esperado" value={fmtMin(rptStats.texp)} gradient="from-green-500 to-green-600" />
                    <StatCard label="Extra paga" value={fmtMin(rptStats.te + rptStats.tePaid)} gradient="from-amber-500 to-yellow-500" />
                    <StatCard label="Banco 🏦" value={fmtMin(rptStats.tb)} gradient="from-purple-500 to-violet-600" />
                </div>
                <div className={`p-4 rounded-2xl text-center ${rptStats.bal >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p className="mono text-3xl font-extrabold count-anim">{rptStats.bal >= 0 ? '+' : ''}{fmtMin(rptStats.bal)}</p>
                    <p className="text-sm font-bold mt-1">{rptStats.bal >= 0 ? '✅ Saldo Positivo' : '⚠️ Saldo Negativo'}</p>
                    <p className="text-xs opacity-60 mt-0.5">{rptStats.days} dias trabalhados</p>
                </div>
            </section>

            {/* Detalhamento diário */}
            {rptStats.worked.length > 0 && <section className={`${card} rounded-2xl shadow p-4`}>
                <h2 className="font-bold text-sm mb-3">📅 Detalhamento — {MNAMES_FULL[rptMonth]} {rptYear}</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto no-sb">
                    {[...rptStats.worked].reverse().map(({ date, s }) => (
                        <div key={date.toISOString()} className={`p-3 rounded-xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex justify-between items-start">
                                <div><p className="font-bold text-sm capitalize">{date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</p><p className="text-xs opacity-50">{s.pairs} período{s.pairs > 1 ? 's' : ''}</p></div>
                                <div className="text-right"><p className="mono font-bold text-blue-600 text-sm">{fmtMin(s.workMin)}</p><p className="text-xs opacity-50">esp: {fmtMin(s.expMin)}</p>{(s.extraMin + s.extraPaidMin) > 0 && <p className="text-xs text-yellow-600 font-bold badge-extra inline-block">+{fmtMin(s.extraMin + s.extraPaidMin)}</p>}{s.bankMin > 0 && <p className="text-xs text-purple-600 font-bold">🏦{fmtMin(s.bankMin)}</p>}</div>
                            </div>
                            <p className={`mt-1 text-xs font-bold ${s.balMin >= 0 ? 'text-green-600' : 'text-red-500'}`}>Saldo: {s.balMin >= 0 ? '+' : ''}{fmtMin(s.balMin)}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1">{s.recs.map((r, i) => <span key={i} className={`text-xs px-2 py-0.5 rounded-full mono font-bold ${r.type === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{r.type === 'entrada' ? '↗' : '↙'} {new Date(r.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>)}</div>
                        </div>
                    ))}
                </div>
            </section>}
        </div>
    );
};

/* ═══════════════ ABA FINANCEIRO + JORNADA ═══════════════ */
const FinanceiroJornada = ({ card, sub, inp, dark, bdr, sal, setSal, editSal, setEditSal, extraPay, sched, setSched, editSch, setEditSch, picked, setPicked, batch, setBatch, togglePick, applyBatch, saveSch, toast }) => {
    const [subTab, setSubTab] = useState('financeiro');
    return <div className="space-y-3">
        {/* Sub-nav */}
        <div className={`flex p-1 rounded-2xl gap-1 ${dark ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <button onClick={() => setSubTab('financeiro')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${subTab === 'financeiro' ? (dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow') : 'opacity-50'}`}>💰 Financeiro</button>
            <button onClick={() => setSubTab('jornada')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition ${subTab === 'jornada' ? (dark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow') : 'opacity-50'}`}>⚙️ Jornada</button>
        </div>

        {/* ── Financeiro ── */}
        {subTab === 'financeiro' && <>
            <section className={`${card} rounded-2xl shadow p-4`}>
                <h2 className="font-bold text-sm flex items-center gap-2 mb-4"><Icon name="trend" className="w-4 h-4" />💰 Configuração Salarial</h2>
                {editSal ? (<div className="space-y-3">
                    <div><label className="text-xs font-semibold opacity-60 block mb-1">Salário Base (R$)</label><input type="number" value={sal.salary} onChange={e => setSal({ ...sal, salary: e.target.value })} placeholder="3500.00" className={`w-full p-3 rounded-xl border ${inp} text-sm mono font-bold`} /></div>
                    <div><label className="text-xs font-semibold opacity-60 block mb-1">Carga Horária Mensal (horas)</label><input type="number" value={sal.workload} onChange={e => setSal({ ...sal, workload: e.target.value })} className={`w-full p-3 rounded-xl border ${inp} text-sm mono font-bold`} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-semibold opacity-60 block mb-1">% Extra Dia Útil</label><input type="number" value={sal.wdPct} onChange={e => setSal({ ...sal, wdPct: e.target.value })} className={`w-full p-3 rounded-xl border ${inp} text-sm mono font-bold`} /></div>
                        <div><label className="text-xs font-semibold opacity-60 block mb-1">% Extra Fim de Semana</label><input type="number" value={sal.wePct} onChange={e => setSal({ ...sal, wePct: e.target.value })} className={`w-full p-3 rounded-xl border ${inp} text-sm mono font-bold`} /></div>
                    </div>
                    <button onClick={() => { safeLS.set('pc_s', sal); setEditSal(false); toast('💰 Salário salvo!', 'success'); }} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold active:scale-95">✓ Salvar</button>
                </div>) : (<div>
                    <div className={`p-3 rounded-xl ${sub} mb-3`}>
                        <p className="text-sm"><span className="opacity-50">Salário:</span> <span className="mono font-bold">R$ {parseFloat(sal.salary || 0).toFixed(2)}</span></p>
                        <p className="text-sm"><span className="opacity-50">Carga:</span> <span className="mono font-bold">{sal.workload}h/mês</span></p>
                        <p className="text-sm"><span className="opacity-50">Extra:</span> <span className="mono font-bold">{sal.wdPct}% (útil) / {sal.wePct}% (fds)</span></p>
                    </div>
                    <button onClick={() => setEditSal(true)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold active:scale-95"><Icon name="edit" className="w-3.5 h-3.5 inline mr-1" />Editar</button>
                </div>)}
            </section>
            {extraPay && <>
                <section className={`${card} rounded-2xl shadow p-4`}>
                    <h2 className="font-bold text-sm mb-3 flex items-center gap-2">⏱️ Resumo de Horas — Mês atual</h2>
                    <div className="grid grid-cols-3 gap-2">
                        <div className={`p-3 rounded-xl text-center ${dark ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-800'}`}><p className="text-[10px] font-semibold opacity-70 uppercase tracking-wide">Trabalhadas</p><p className="mono font-extrabold text-base mt-1">{fmtMin(extraPay.totalWorkMin)}</p></div>
                        <div className={`p-3 rounded-xl text-center ${dark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-50 text-amber-800'}`}><p className="text-[10px] font-semibold opacity-70 uppercase tracking-wide">Extras pagas</p><p className="mono font-extrabold text-base mt-1">{fmtMin((extraPay.wdPaidH + extraPay.wePaidH) * 60)}</p></div>
                        <div className={`p-3 rounded-xl text-center ${dark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-800'}`}><p className="text-[10px] font-semibold opacity-70 uppercase tracking-wide">Banco</p><p className="mono font-extrabold text-base mt-1">{fmtMin(extraPay.totalBank * 60)}</p></div>
                    </div>
                </section>
                <section className={`${card} rounded-2xl shadow p-4`}>
                    <h2 className="font-bold text-sm mb-3 flex items-center gap-2">💰 Horas Extras Remuneradas</h2>
                    <div className={`p-3 rounded-xl ${sub} mb-3 flex items-center justify-between`}><span className="text-xs opacity-50">Valor hora normal</span><span className="mono font-bold">R$ {extraPay.hv.toFixed(2)}</span></div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className={`p-3 rounded-xl ${dark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-50 text-amber-800'}`}><p className="text-[10px] font-semibold opacity-70">Dias úteis ({sal.wdPct}%)</p><p className="mono font-bold text-sm mt-1">{extraPay.wdPaidH.toFixed(1)}h</p><p className="text-[10px] opacity-50">R$ {extraPay.hvWd.toFixed(2)}/h</p><p className="mono font-bold mt-1">R$ {extraPay.wdT.toFixed(2)}</p></div>
                        <div className={`p-3 rounded-xl ${dark ? 'bg-orange-900/40 text-orange-300' : 'bg-orange-50 text-orange-800'}`}><p className="text-[10px] font-semibold opacity-70">Fim de semana ({sal.wePct}%)</p><p className="mono font-bold text-sm mt-1">{extraPay.wePaidH.toFixed(1)}h</p><p className="text-[10px] opacity-50">R$ {extraPay.hvWe.toFixed(2)}/h</p><p className="mono font-bold mt-1">R$ {extraPay.weT.toFixed(2)}</p></div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between shadow-lg"><div><p className="text-xs opacity-80">Total a receber em extras</p><p className="mono text-2xl font-extrabold">R$ {extraPay.total.toFixed(2)}</p></div><span className="text-3xl">💰</span></div>
                </section>
                <section className={`${card} rounded-2xl shadow p-4`}>
                    <h2 className="font-bold text-sm mb-3 flex items-center gap-2">🏦 Banco de Horas</h2>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className={`p-3 rounded-xl ${dark ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-50 text-purple-800'}`}><p className="text-[10px] font-semibold opacity-70">Dias úteis</p><p className="mono font-bold text-sm mt-1">{extraPay.wdBankH.toFixed(1)}h</p></div>
                        <div className={`p-3 rounded-xl ${dark ? 'bg-violet-900/40 text-violet-300' : 'bg-violet-50 text-violet-800'}`}><p className="text-[10px] font-semibold opacity-70">Fim de semana</p><p className="mono font-bold text-sm mt-1">{extraPay.weBankH.toFixed(1)}h</p></div>
                    </div>
                    <div className={`p-4 rounded-2xl flex items-center justify-between ${dark ? 'bg-purple-900/50 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}><div><p className={`text-xs ${dark ? 'text-purple-400' : 'text-purple-600'} opacity-80`}>Total acumulado no banco</p><p className={`mono text-2xl font-extrabold ${dark ? 'text-purple-300' : 'text-purple-700'}`}>{fmtMin(extraPay.totalBank * 60)}</p></div><span className="text-3xl">🏦</span></div>
                </section>
            </>}
        </>}

        {/* ── Jornada ── */}
        {subTab === 'jornada' && <section className={`${card} rounded-2xl shadow p-4`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base flex items-center gap-2"><Icon name="gear" className="w-5 h-5" />Jornada por Dia</h2>
                {editSch ? <button onClick={saveSch} className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-bold active:scale-95 shadow-lg shadow-green-200">✓ Salvar</button>
                    : <button onClick={() => setEditSch(true)} className="p-2.5 bg-blue-500 text-white rounded-xl active:scale-95"><Icon name="edit" className="w-4 h-4" /></button>}
            </div>
            {editSch ? (<div className="space-y-5">
                <div className={`rounded-2xl border-2 border-dashed overflow-hidden ${dark ? 'border-blue-700 bg-blue-950/30' : 'border-blue-200 bg-blue-50'}`}>
                    <div className={`px-4 py-3 font-bold text-sm ${dark ? 'text-blue-300' : 'text-blue-700'}`}>⚡ Aplicar mesmo horário</div>
                    <div className="px-3 pb-3 flex gap-1.5">{DAYS.map(dk => <button key={dk} onClick={() => togglePick(dk)} className={`dpill ${picked.includes(dk) ? 'dpill-sel' : sched[dk].active ? 'dpill-on' : 'dpill-off'}`}>{DSHORT[dk]}</button>)}</div>
                    <div className="px-3 pb-3 flex gap-2 flex-wrap">
                        <button onClick={() => setPicked(DAYS.filter(dk => sched[dk].active))} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 active:scale-95 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-blue-200 text-blue-700'}`}>Dias ativos</button>
                        <button onClick={() => setPicked([...DAYS])} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 active:scale-95 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-indigo-200 text-indigo-700'}`}>Todos</button>
                        {picked.length > 0 && <button onClick={() => setPicked([])} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 active:scale-95 ${dark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200 text-gray-500'}`}>Limpar ({picked.length})</button>}
                    </div>
                    <div className={`mx-3 mb-4 p-4 rounded-2xl ${dark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                            <TimePicker label="Início" value={batch.start} onChange={v => setBatch({ ...batch, start: v })} dark={dark} bdr={bdr} id="batch-start" />
                            <TimePicker label="Fim" value={batch.end} onChange={v => setBatch({ ...batch, end: v })} dark={dark} bdr={bdr} id="batch-end" />
                            <div><label className="block text-xs font-semibold opacity-50 mb-1 text-center">Almoço</label><select value={batch.lunch} onChange={e => setBatch({ ...batch, lunch: Number(e.target.value) })} className={`tsel w-full py-2.5 rounded-xl border-2 ${bdr} text-sm ${dark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}>{[0, 15, 30, 45, 60, 90, 120].map(v => <option key={v} value={v}>{v}min</option>)}</select></div>
                        </div>
                        <p className="text-xs text-center opacity-60 font-semibold mb-3">⏱ {fmtMin(Math.max(0, t2m(batch.end) - t2m(batch.start) - Number(batch.lunch)))} por dia</p>
                        <button onClick={applyBatch} disabled={!picked.length} className={`w-full py-3.5 rounded-xl text-sm font-bold transition active:scale-95 ${picked.length ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200' : `${dark ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`}`}>{picked.length ? `✓ Aplicar aos ${picked.length} dia(s)` : '⬆ Selecione os dias acima'}</button>
                    </div>
                </div>
                <div><p className="text-xs font-bold uppercase tracking-widest opacity-40 px-1 mb-2">Ajuste individual</p>
                    <div className="space-y-2">{DAYS.map(dk => {
                        const s = sched[dk]; const total = s.active ? Math.max(0, t2m(s.end) - t2m(s.start) - s.lunch) : 0; return (
                            <div key={dk} className={`rounded-2xl p-3.5 border-2 transition-all ${picked.includes(dk) ? `border-blue-400 ${dark ? 'bg-blue-950/40' : 'bg-blue-50/70'}` : `border-transparent ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setSched(p => ({ ...p, [dk]: { ...p[dk], active: !p[dk].active } }))} className={`tog-track ${s.active ? 'bg-green-500' : 'bg-gray-300'}`}><div className="tog-thumb" style={{ left: s.active ? '21px' : '3px' }} /></button>
                                        <span className="font-bold text-sm">{DLABEL[dk]}</span>
                                    </div>
                                    {s.active ? <span className="mono text-xs font-bold text-blue-500">{fmtMin(total)}/dia</span> : <span className="text-xs opacity-40 italic">Folga</span>}
                                </div>
                                {s.active && <div className="grid grid-cols-3 gap-2 mt-3">
                                    <TimePicker label="Início" value={s.start} onChange={v => setSched(p => ({ ...p, [dk]: { ...p[dk], start: v } }))} dark={dark} bdr={bdr} id={`${dk}-s`} />
                                    <TimePicker label="Fim" value={s.end} onChange={v => setSched(p => ({ ...p, [dk]: { ...p[dk], end: v } }))} dark={dark} bdr={bdr} id={`${dk}-e`} />
                                    <div><label className="block text-xs opacity-50 mb-1 text-center">Almoço</label><select value={s.lunch} onChange={e => setSched(p => ({ ...p, [dk]: { ...p[dk], lunch: Number(e.target.value) } }))} className={`tsel w-full py-2.5 rounded-xl border-2 ${bdr} text-xs ${dark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'}`}>{[0, 15, 30, 45, 60, 90, 120].map(v => <option key={v} value={v}>{v}min</option>)}</select></div>
                                </div>}
                            </div>
                        );
                    })}</div>
                </div>
                <div className="flex gap-2 pt-1">
                    <button onClick={saveSch} className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold active:scale-95 shadow-lg shadow-green-200">✓ Salvar Jornada</button>
                    <button onClick={() => { setEditSch(false); setPicked([]); }} className="flex-1 py-4 bg-gray-400 text-white rounded-2xl font-bold active:scale-95">✕ Cancelar</button>
                </div>
            </div>) : (
                <div className="space-y-2">{DAYS.map(dk => {
                    const s = sched[dk]; const total = s.active ? Math.max(0, t2m(s.end) - t2m(s.start) - s.lunch) : 0; return (
                        <div key={dk} className={`flex items-center justify-between px-4 py-3 rounded-2xl ${dark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2.5"><div className={`w-2.5 h-2.5 rounded-full ${s.active ? 'bg-green-500' : 'bg-gray-400'}`} /><span className="font-semibold text-sm">{DLABEL[dk]}</span></div>
                            {s.active ? <div className="text-right"><p className="mono text-sm font-bold">{s.start} – {s.end}</p><p className="text-xs opacity-50">{fmtMin(total)} · almoço {s.lunch}min</p></div> : <span className="text-xs opacity-40 italic">Folga</span>}
                        </div>
                    );
                })}</div>
            )}
        </section>}
    </div>;
};

/* ═══════════════ ABA PERFIL ═══════════════ */
const PerfilTab = ({ user, setUser, editUsr, setEditUsr, records, mStats, deleteAll, dark, card, sub, bdr, inp, toast }) => (
    <div className="space-y-3">
        <section className={`${card} rounded-2xl shadow p-4`}>
            <h2 className="font-bold text-sm flex items-center gap-2 mb-4"><Icon name="user" className="w-4 h-4" />👤 Perfil</h2>
            {editUsr ? (<div className="space-y-3">
                <div><label className="text-xs font-semibold opacity-60 block mb-1">Nome</label><input type="text" value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} placeholder="Seu nome" className={`w-full p-3 rounded-xl border ${inp} text-sm font-semibold`} /></div>
                <div><label className="text-xs font-semibold opacity-60 block mb-1">Email</label><input type="email" value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} placeholder="seu@email.com" className={`w-full p-3 rounded-xl border ${inp} text-sm font-semibold`} /></div>
                <button onClick={() => { if (!user.name) { toast('⚠️ Nome é obrigatório!', 'error'); return; } safeLS.set('pc_u', user); setEditUsr(false); toast('✅ Perfil salvo!', 'success'); }} className="w-full py-3 bg-green-500 text-white rounded-xl font-bold active:scale-95">✓ Salvar Perfil</button>
            </div>) : (<div>
                <div className={`p-4 rounded-xl ${sub} mb-3 flex items-center gap-3`}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">{(user.name || '?')[0].toUpperCase()}</div>
                    <div><p className="font-bold">{user.name}</p><p className="text-xs opacity-50">{user.email || 'Sem email'}</p></div>
                </div>
                <button onClick={() => setEditUsr(true)} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-bold active:scale-95"><Icon name="edit" className="w-3.5 h-3.5 inline mr-1" />Editar Perfil</button>
            </div>)}
        </section>
        <section className={`${card} rounded-2xl shadow p-4`}>
            <h2 className="font-bold text-sm mb-3">📊 Estatísticas</h2>
            <div className={`space-y-2 ${sub} p-3 rounded-xl`}>
                <p className="text-sm flex justify-between"><span className="opacity-50">Total de registros:</span><span className="mono font-bold">{records.length}</span></p>
                <p className="text-sm flex justify-between"><span className="opacity-50">Dias trabalhados (mês):</span><span className="mono font-bold">{mStats.days}</span></p>
                <p className="text-sm flex justify-between"><span className="opacity-50">Saldo mensal:</span><span className={`mono font-bold ${mStats.bal >= 0 ? 'text-green-600' : 'text-red-500'}`}>{mStats.bal >= 0 ? '+' : ''}{fmtMin(mStats.bal)}</span></p>
            </div>
        </section>
        <section className={`${card} rounded-2xl shadow p-4`}>
            <h2 className="font-bold text-sm mb-3 text-red-500">⚠️ Zona de Perigo</h2>
            <button onClick={deleteAll} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold active:scale-95 flex items-center justify-center gap-2"><Icon name="trash" className="w-4 h-4" />Apagar Todos os Registros</button>
            <p className="text-xs opacity-40 text-center mt-2">Esta ação não pode ser desfeita</p>
        </section>
        <div className="text-center text-xs opacity-30 py-4"><p className="font-bold">PontoCerto v2.0</p><p>Controle de Jornada Inteligente</p></div>
    </div>
);
