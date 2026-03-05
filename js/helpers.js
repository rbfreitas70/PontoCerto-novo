/* ═══════════════════════════════════════════════════════
   PontoCerto — Funções Utilitárias
   ═══════════════════════════════════════════════════════ */

/** Converte "HH:MM" → total de minutos */
function t2m(s) {
    if (!s || typeof s !== 'string' || !s.includes(':')) return 0;
    var parts = s.split(':').map(Number);
    if (isNaN(parts[0]) || isNaN(parts[1])) return 0;
    return parts[0] * 60 + parts[1];
}

/** Formata minutos totais → "Xh YYm" */
function fmtMin(total) {
    var neg = total < 0;
    var abs = Math.abs(Math.round(total));
    var h = Math.floor(abs / 60);
    var m = abs % 60;
    return (neg ? '-' : '') + h + 'h' + (m > 0 ? String(m).padStart(2, '0') + 'm' : '');
}

/** Valida que horário "end" é posterior a "start" */
function validateTimeOrder(s, e) {
    return t2m(e) > t2m(s);
}

/** LocalStorage seguro (try/catch em get/set) */
var safeLS = {
    get: function (k) {
        try { return JSON.parse(localStorage.getItem(k)); }
        catch (e) { return null; }
    },
    set: function (k, v) {
        try { localStorage.setItem(k, JSON.stringify(v)); return true; }
        catch (e) { return false; }
    }
};
