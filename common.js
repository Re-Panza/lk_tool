/* L&K Tools - Super Common JS
   Gestisce: Multilingua, DB, UI, Utility per tutti i tool
*/

// --- 1. DIZIONARIO TRADUZIONI (12 LINGUE) ---
const TRANSLATIONS = {
    it: {
        flag: "🇮🇹", name: "Italiano",
        // Nav & Footer
        nav_home: "🏠 Torna alla Home",
        footer_like: "Ti piace questo strumento?",
        footer_coffee: "☕ Offrimi un caffè su PayPal",
        // Home
        home_title: "⚔️ L&K Tools Hub",
        home_subtitle: "Semplifica la tua strategia di conquista",
        card_search_title: "Ricerca Giocatori & Inattivi",
        card_search_desc: "Trova tutti i castelli di un giocatore.",
        card_calc_title: "Calcola Partenze",
        card_calc_desc: "Calcola orari per liste di link.",
        card_silver_title: "Calcolo Argento",
        card_silver_desc: "Quanto argento serve per conquistare.",
        card_st_title: "Self Trick",
        card_st_desc: "Calcola tempi perfetti e coperture.",
        // Self Trick & Partenze
        lbl_attacker: "👤 Profilo Attaccante",
        ph_attacker: "Incolla link profilo...",
        lbl_target_link: "Link castello attaccato",
        lbl_targets: "🔗 Link Bersagli (Uno per riga)",
        ph_targets: "Incolla qui i link...",
        lbl_date: "Data Impatto",
        lbl_time: "Ora Impatto",
        lbl_hab: "Habitat Partenza",
        lbl_troop: "Truppa",
        lbl_batch: "Plotone",
        lbl_total_troops: "Truppe Totali",
        btn_calc: "CALCOLA",
        btn_reset: "RESET",
        // Self Trick Specific
        st_lag: "🐢 Ritardo Server (+5% tempo)",
        st_wait: "Attendi",
        st_launch: "LANCIA ORA!",
        st_launched: "⚠ LANCIO ESEGUITO",
        st_covered: "✅ Turno Coperto",
        st_expired: "Scaduto",
        st_copy_instr: "Clicca COPRI al rientro",
        // Ricerca
        search_title: "🔍 Ricerca Target",
        search_ph: "Incolla profilo giocatore o alleanza...",
        btn_search: "AVVIA RICERCA",
        btn_dl_sel: "📥 SCARICA SELEZIONATI",
        btn_dl_all: "📥 SCARICA TUTTI",
        status_active: "✅ ATTIVO",
        status_inactive: "⚠️ INATTIVO",
        // Argento
        ag_title: "Calcolo Argento",
        ag_owned: "🏰 Habitat posseduti",
        ag_conquest: "🎯 Conquista",
        ag_qty: "Quanti",
        ag_coord: "Coordinato (simultaneo)",
        ag_promo: "Promo 50%"
    },
    en: {
        flag: "🇬🇧", name: "English",
        nav_home: "🏠 Back to Home",
        footer_like: "Do you like this tool?",
        footer_coffee: "☕ Buy me a coffee",
        home_title: "⚔️ L&K Tools Hub",
        home_subtitle: "Simplify your strategy",
        card_search_title: "Player Search",
        card_search_desc: "Find all player castles.",
        card_calc_title: "Departure Calc",
        card_calc_desc: "Calculate launch times.",
        card_silver_title: "Silver Calc",
        card_silver_desc: "Calculate required silver.",
        card_st_title: "Self Trick",
        card_st_desc: "Perfect timing for self trick.",
        lbl_attacker: "👤 Attacker Profile",
        ph_attacker: "Paste profile link...",
        lbl_target_link: "Target Castle Link",
        lbl_targets: "🔗 Target Links",
        ph_targets: "Paste links here...",
        lbl_date: "Impact Date",
        lbl_time: "Impact Time",
        lbl_hab: "Start Habitat",
        lbl_troop: "Troop",
        lbl_batch: "Batch",
        lbl_total_troops: "Total Troops",
        btn_calc: "CALCULATE",
        btn_reset: "RESET",
        st_lag: "🐢 Server Lag (+5% time)",
        st_wait: "Wait",
        st_launch: "LAUNCH NOW!",
        st_launched: "⚠ LAUNCHED",
        st_covered: "✅ Turn Covered",
        st_expired: "Expired",
        st_copy_instr: "Click COVER on return",
        search_title: "🔍 Target Search",
        search_ph: "Paste player or alliance link...",
        btn_search: "START SEARCH",
        btn_dl_sel: "📥 DOWNLOAD SELECTED",
        btn_dl_all: "📥 DOWNLOAD ALL",
        status_active: "✅ ACTIVE",
        status_inactive: "⚠️ INACTIVE",
        ag_title: "Silver Calculator",
        ag_owned: "🏰 Owned Habitats",
        ag_conquest: "🎯 Conquest",
        ag_qty: "Quantity",
        ag_coord: "Coordinated",
        ag_promo: "Promo 50%"
    },
    de: {
        flag: "🇩🇪", name: "Deutsch",
        nav_home: "🏠 Zurück zur Startseite",
        footer_like: "Gefällt dir das Tool?",
        footer_coffee: "☕ Spendier mir einen Kaffee",
        home_title: "⚔️ L&K Tools Hub",
        home_subtitle: "Vereinfache deine Strategie",
        card_search_title: "Spieler Suche",
        card_search_desc: "Finde alle Burgen.",
        card_calc_title: "Abmarsch Rechner",
        card_calc_desc: "Berechne Startzeiten.",
        card_silver_title: "Silber Rechner",
        card_silver_desc: "Berechne Silberkosten.",
        card_st_title: "Self Trick",
        card_st_desc: "Perfektes Timing für Self Trick.",
        lbl_attacker: "👤 Angreifer Profil",
        ph_attacker: "Profil-Link einfügen...",
        lbl_target_link: "Ziel-Burg Link",
        lbl_targets: "🔗 Ziel Links",
        ph_targets: "Links hier einfügen...",
        lbl_date: "Einschlag Datum",
        lbl_time: "Einschlag Zeit",
        lbl_hab: "Start Habitat",
        lbl_troop: "Truppen",
        lbl_batch: "Trupp",
        lbl_total_troops: "Gesamt Truppen",
        btn_calc: "BERECHNEN",
        btn_reset: "RESET",
        st_lag: "🐢 Server Lag (+5% Zeit)",
        st_wait: "Warten",
        st_launch: "JETZT STARTEN!",
        st_launched: "⚠ GESTARTET",
        st_covered: "✅ Runde Abgedeckt",
        st_expired: "Abgelaufen",
        st_copy_instr: "Klicke ABDECKEN bei Rückkehr",
        search_title: "🔍 Ziel Suche",
        search_ph: "Spieler oder Allianz Link...",
        btn_search: "SUCHE STARTEN",
        btn_dl_sel: "📥 AUSWAHL LADEN",
        btn_dl_all: "📥 ALLE LADEN",
        status_active: "✅ AKTIV",
        status_inactive: "⚠️ INAKTIV",
        ag_title: "Silber Rechner",
        ag_owned: "🏰 Eigene Habitate",
        ag_conquest: "🎯 Eroberung",
        ag_qty: "Menge",
        ag_coord: "Koordiniert",
        ag_promo: "Promo 50%"
    },
    // Altre lingue (ES, FR, ecc.) possono essere aggiunte qui seguendo lo schema
};

// --- 2. GESTIONE LINGUA & UI ---
let currentLang = localStorage.getItem('lk_tool_lang') || 'it';

function initLanguage() {
    // Crea selettore
    const container = document.createElement('div');
    container.style.cssText = "position:absolute; top:10px; right:10px; z-index:2000;";
    
    const select = document.createElement('select');
    select.style.cssText = "background:rgba(0,0,0,0.6); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:20px; padding:5px 10px; font-size:14px; cursor:pointer; outline:none; backdrop-filter:blur(5px);";
    
    Object.keys(TRANSLATIONS).forEach(code => {
        const opt = document.createElement('option');
        opt.value = code;
        opt.innerText = `${TRANSLATIONS[code].flag} ${TRANSLATIONS[code].name}`;
        if(code === currentLang) opt.selected = true;
        select.appendChild(opt);
    });

    select.onchange = (e) => {
        currentLang = e.target.value;
        localStorage.setItem('lk_tool_lang', currentLang);
        applyTranslations();
    };
    
    container.appendChild(select);
    
    // Inserisci nel posto giusto
    const nav = document.querySelector('.top-nav');
    if(nav) {
        nav.style.position = 'relative';
        nav.appendChild(container);
    } else {
        document.body.prepend(container);
    }
    
    applyTranslations();
}

function applyTranslations() {
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        const text = TRANSLATIONS[currentLang][key];
        if(text) {
            if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = text;
            else el.innerHTML = text;
        }
    });
}

// --- 3. GESTIONE DATABASE CENTRALIZZATA ---
const LK_API = {
    // Scarica Configurazione Truppe
    async loadGameConfig() {
        try {
            const r = await fetch('https://raw.githubusercontent.com/Re-Panza/lk_database/main/database_truppe.json?v=' + Date.now());
            if(!r.ok) throw new Error("Network error");
            return await r.json();
        } catch(e) {
            console.error("Errore Truppe:", e);
            alert("Errore caricamento dati truppe. Riprova.");
            return null;
        }
    },

    // Scarica Mondo e Nomi (Gestisce eccezione 327)
    async fetchWorldData(worldId) {
        let urlDB, urlNames;
        
        if (worldId === "327") {
            urlDB = "https://raw.githubusercontent.com/Re-Panza/lk_scanner/main/database_mondo_327.json";
            urlNames = "https://raw.githubusercontent.com/Re-Panza/scanner_classifica327/main/database_classificamondo327.json";
        } else {
            urlDB = `https://raw.githubusercontent.com/Re-Panza/lk_database/main/database_mondo_${worldId}.json`;
            urlNames = `https://raw.githubusercontent.com/Re-Panza/lk_database/main/database_classificamondo${worldId}.json`;
        }

        try {
            const [dbRes, namesRes] = await Promise.all([
                fetch(urlDB + "?v=" + Date.now()).then(r => r.ok ? r.json() : []),
                fetch(urlNames + "?v=" + Date.now()).then(r => r.ok ? r.json() : [])
            ]);

            // Processa Castelli (Flattening)
            let flatDB = [];
            const flatten = (n) => { 
                if(Array.isArray(n)) n.forEach(flatten); 
                else if(n && n.x) { n.p = n.p || n.pid || n.playerid || 0; n.pt = n.pt || n.points || 0; flatDB.push(n); }
                else if(typeof n==='object') Object.values(n).forEach(flatten); 
            };
            flatten(dbRes);

            // Processa Nomi (Mappa ID -> Nome)
            let namesMap = {};
            if(Array.isArray(namesRes)) {
                namesRes.forEach(p => {
                    const pid = p.id || p.p;
                    const name = p.nick || p.name || p.n;
                    if(pid && name) namesMap[parseInt(pid)] = name;
                });
            }

            return { db: flatDB, names: namesMap };

        } catch(e) {
            console.error("Errore Mondo " + worldId, e);
            alert("Errore caricamento Mondo " + worldId);
            return null;
        }
    }
};

// --- 4. UTILITY CONDIVISE ---
function getDist(x1, y1, x2, y2) {
    let cy1 = y1, cz1 = x1 - Math.floor(y1 / 2), cx1 = -cy1 - cz1;
    let cy2 = y2, cz2 = x2 - Math.floor(y2 / 2), cx2 = -cy2 - cz2;
    return Math.max(Math.abs(cx1 - cx2), Math.abs(cy1 - cy2), Math.abs(cz1 - cz2));
}

function pad(n) { return n < 10 ? '0' + n : n; }

function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    let t = document.createElement("div");
    t.className = "toast";
    t.innerText = msg;
    Object.assign(t.style, {
        position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)',
        background:'rgba(52, 211, 153, 0.95)', color:'#000', padding:'12px 24px',
        borderRadius:'50px', fontWeight:'bold', zIndex:'10000', pointerEvents:'none',
        opacity:'0', transition:'0.3s'
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity='1'; t.style.transform='translate(-50%, -10px)'; });
    setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(), 300); }, 2000);
}

function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast("Copiato: " + text));
}

function toggleAI() {
    const win = document.getElementById('ai-window');
    if(win) win.style.display = (win.style.display==='none'||win.style.display==='') ? 'block':'none';
}

// --- 5. INIT ---
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    
    // AI Keypress
    const aiInput = document.getElementById('ai-input');
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && typeof chiediAlRe === 'function') chiediAlRe();
        });
    }
    
    // Service Worker
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
});
