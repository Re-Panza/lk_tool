/* L&K Tools - Common Functions 
   Gestisce: AI, Toast Notifications, Clipboard, Utility, Math, PWA Updates
*/

// --- 1. CALCOLO DISTANZA ESAGONALE ---
function getDist(x1, y1, x2, y2) {
    let cy1 = y1;
    let cz1 = x1 - Math.floor(y1 / 2);
    let cx1 = -cy1 - cz1;

    let cy2 = y2;
    let cz2 = x2 - Math.floor(y2 / 2);
    let cx2 = -cy2 - cz2;

    return Math.max(Math.abs(cx1 - cx2), Math.abs(cy1 - cy2), Math.abs(cz1 - cz2));
}

// --- 2. PARSING LINK COORDINATE ---
function parseLKLink(url) {
    let m = url.match(/coordinates\?(\d+),(\d+)&(\d+)/);
    if (!m) return null;
    return { x: parseInt(m[1]), y: parseInt(m[2]), w: m[3] };
}

// --- 3. TOAST MESSAGE ---
function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    let t = document.createElement("div");
    t.className = "toast";
    t.innerText = msg;
    
    Object.assign(t.style, {
        position: 'fixed',
        bottom: '90px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(52, 211, 153, 0.95)',
        color: '#000',
        padding: '12px 24px',
        borderRadius: '50px',
        fontWeight: 'bold',
        zIndex: '10000',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        fontFamily: 'system-ui, sans-serif',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.3s, transform 0.3s',
        whiteSpace: 'nowrap'
    });

    document.body.appendChild(t);
    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translate(-50%, -10px)';
    });

    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translate(-50%, 0)';
        setTimeout(() => t.remove(), 300);
    }, 2000);
}

// --- 4. CLIPBOARD & UTILITY ---
function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast("Copiato: " + text));
}

function pad(n) { 
    return n < 10 ? '0' + n : n; 
}

// --- 5. GESTIONE AI ---
function toggleAI() {
    const win = document.getElementById('ai-window');
    if (!win) return;
    win.style.display = (win.style.display === 'none' || win.style.display === '') ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.getElementById('ai-input');
    if (aiInput) {
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && typeof chiediAlRe === 'function') chiediAlRe();
        });
    }
});

/* =========================================
   6. GESTORE AGGIORNAMENTI PWA (CENTRALE)
   ========================================= */
(function() {
    // Recupera la versione salvata nel browser
    const currentSavedVersion = localStorage.getItem('lk_tool_version');

    // Al caricamento della pagina, controlla APP_VERSION
    window.addEventListener('load', function() {
        // APP_VERSION deve essere definita in version.js (caricato PRIMA di common.js)
        if (typeof APP_VERSION !== 'undefined') {
            
            // Debug (opzionale)
            // console.log(`Versione Salvata: ${currentSavedVersion} | Versione Online: ${APP_VERSION}`);

            // Se è la prima volta assoluta
            if (!currentSavedVersion) {
                localStorage.setItem('lk_tool_version', APP_VERSION);
            } 
            // Se le versioni sono diverse -> Mostra Banner
            else if (APP_VERSION !== currentSavedVersion) {
                _mostraBannerAggiornamento(APP_VERSION);
            }
        }
    });

    // Funzione interna per disegnare il banner
    function _mostraBannerAggiornamento(newVer) {
        // Evita di creare doppi banner
        if (document.getElementById('pwa-update-banner')) return;

        const div = document.createElement('div');
        div.id = 'pwa-update-banner';
        div.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            width: 90%; max-width: 400px;
            background: rgba(16, 185, 129, 0.95); /* Verde */
            border: 2px solid #fff;
            border-radius: 16px;
            color: white; 
            padding: 20px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.6); 
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex; flex-direction: column; align-items: center; gap: 10px;
            animation: slideUp 0.5s ease-out;
            font-family: sans-serif; text-align: center;
        `;
        
        div.innerHTML = `
            <div style="font-weight:800; font-size:16px; text-transform:uppercase; letter-spacing:1px;">
                🚀 Aggiornamento ${newVer}
            </div>
            <div style="font-size:13px; opacity:0.9; margin-bottom:5px;">
                Nuove funzioni disponibili!
            </div>
            <button id="btnReloadPWA" style="
                background: #fff; color: #10b981; border: none; 
                padding: 10px 24px; border-radius: 50px; 
                font-weight: 800; font-size: 14px; cursor: pointer;
                text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            ">
                🔄 AGGIORNA ORA
            </button>
        `;

        // Click handler: salva nuova versione e ricarica
        div.querySelector('#btnReloadPWA').onclick = function() {
            localStorage.setItem('lk_tool_version', newVer);
            window.location.reload();
        };
        
        document.body.appendChild(div);
    }
})();
