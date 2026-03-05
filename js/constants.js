/* ═══════════════════════════════════════════════════════
   PontoCerto — Constantes e Configuração
   ═══════════════════════════════════════════════════════ */

var DAYS  = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

var DLABEL = {
    monday:'Segunda', tuesday:'Terça', wednesday:'Quarta',
    thursday:'Quinta', friday:'Sexta', saturday:'Sábado', sunday:'Domingo'
};

var DSHORT = {
    monday:'Seg', tuesday:'Ter', wednesday:'Qua',
    thursday:'Qui', friday:'Sex', saturday:'Sáb', sunday:'Dom'
};

/* Mapeamento do getDay() (0=dom) para chave do DAYS */
var JS2D = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];

/* Listas para selects */
var HH     = Array.from({ length:24 }, function(_,i){ return String(i).padStart(2,'0'); });
var MM_ARR = Array.from({ length:60 }, function(_,i){ return String(i).padStart(2,'0'); });
var YEARS  = Array.from({ length:20 }, function(_,i){ return new Date().getFullYear() - 5 + i; });
var MONTHS = Array.from({ length:12 }, function(_,i){ return String(i+1).padStart(2,'0'); });

var MNAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

var MNAMES_FULL = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

/* Jornada padrão */
var DEF_SCH = {
    monday:    { active:true,  start:'07:00', end:'17:00', lunch:60 },
    tuesday:   { active:true,  start:'07:00', end:'17:00', lunch:60 },
    wednesday: { active:true,  start:'07:00', end:'17:00', lunch:60 },
    thursday:  { active:true,  start:'07:00', end:'17:00', lunch:60 },
    friday:    { active:true,  start:'07:00', end:'17:00', lunch:60 },
    saturday:  { active:false, start:'07:00', end:'12:00', lunch:0  },
    sunday:    { active:false, start:'07:00', end:'12:00', lunch:0  },
};
