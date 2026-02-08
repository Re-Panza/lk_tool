/* L&K Tools - Common Functions 
   Gestisce: Database, AI, Utility, Service Worker
*/

// --- 1. GESTIONE DATABASE CENTRALIZZATA ---
const LK_API = {
    // Scarica Configurazione Truppe (Velocità)
    async loadGameConfig() {
        try {
            const r = await fetch('https://raw.githubusercontent.com/Re-Panza/lk_database/main/database_truppe.json?v=' + Date.now());
            if(!r.ok) throw new Error("Errore network truppe");
            return await r.json();
        } catch(e) {
            console.error(e);
            alert("Errore caricamento dati truppe. Riprova.");
            return null;
        }
    },

    // Scarica Dati Mondo (Castelli + Nomi) - Gestisce eccezione Mondo 327
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
            // Scarica in parallelo (più veloce)
            const [dbRes, namesRes] = await Promise.all([
                fetch(urlDB + "?v=" + Date.now()).then(r => r.ok ? r.json() : []),
                fetch(urlNames + "?v=" + Date.now()).then(r => r.ok ? r.json() : [])
            ]);

            // Appiattisci il DB Castelli (spesso è array di array)
            let flatDB = [];
            const flatten = (n) => { 
                if(Array.isArray(n)) n.forEach(flatten); 
                else if(n && n.x) { 
                    n.p = n.p || n.pid || n.playerid || 0; 
                    n.pt = n.pt || n.points || 0; 
                    flatDB.push(n); 
                }
                else if(typeof n==='object') Object.values(n).forEach(flatten); 
            };
            flatten(dbRes);

            // Crea Mappa Nomi (ID -> Nome) per accesso rapido
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
            alert("Errore caricamento database Mondo " + worldId);
            return null;
        }
    }
};

// --- 2. UTILITY MATEMATICHE ---
function getDist(x1, y1, x2, y2) {
    let cy1 = y1, cz1 = x1 - Math.floor(y1 / 2), cx1 = -cy1 - cz1;
    let cy2 = y2, cz2 = x2 - Math.floor(y2 / 2), cx2 = -cy2 - cz2;
    return Math.max(Math.abs(cx1 - cx2), Math.abs(cy1 - cy2), Math.abs(cz1 - cz2));
}

function pad(n) { return n < 10 ? '0' + n : n; }

// --- 3. UI & NOTIFICHE ---
function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    let t = document.createElement("div");
    t.className = "toast";
    t.innerText = msg;
    
    Object.assign(t.style, {
        position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(52, 211, 153, 0.95)', color: '#000', padding: '12px 24px',
        borderRadius: '50px', fontWeight: 'bold', zIndex: '10000',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)', fontFamily: 'system-ui, sans-serif',
        pointerEvents: 'none', opacity: '0', transition: 'opacity 0.3s, transform 0.3s',
        whiteSpace: 'nowrap'
    });

    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translate(-50%, -10px)'; });
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translate(-50%, 0)'; setTimeout(() => t.remove(), 300); }, 2000);
}

function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast("Copiato: " + text), () => alert("Errore copia manuale richiesta"));
}

// --- 4. GESTIONE AI ---
function toggleAI() {
    const win = document.getElementById('ai-window');
    if (!win) return;
    const isHidden = win.style.display === 'none' || win.style.display === '';
    win.style.display = isHidden ? 'block' : 'none';
}

// --- 5. INIZIALIZZAZIONE GLOBALE ---
document.addEventListener('DOMContentLoaded', () => {
    // Gestione Invio nella chat AI
    const aiInput = document.getElementById('ai-input');
    if (aiInput) {
        aiInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && typeof chiediAlRe === 'function') {
                chiediAlRe();
            }
        });
    }

    // Registrazione Service Worker
    if ('serviceWorker' in navigator) {
        // Cerca la variabile globale APP_VERSION definita in version.js nelle pagine HTML
        const v = (typeof APP_VERSION !== 'undefined') ? APP_VERSION : '1.0';
        navigator.serviceWorker.register('sw.js?v=' + v);
    }
});
