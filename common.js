/* L&K Tools - Common Functions 
   Gestisce: AI, Toast, Clipboard, Utility, Math.
   PLUS: Gestione Aggiornamenti (SOLO SU SMARTPHONE)
*/

// --- 0. RILEVATORE DISPOSITIVO ---
// Ritorna TRUE se siamo su smartphone, FALSE se siamo su PC
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
};

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

// --- 3. TOAST MESSAGE (Notifiche a scomparsa) ---
function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    let t = document.createElement("div");
    t.className = "toast";
    t.innerText = msg;
    
    Object.assign(t.style, {
        position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(52, 211, 153, 0.95)', color: '#000',
        padding: '12px 24px', borderRadius: '50px', fontWeight: 'bold',
        zIndex: '10000', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        fontFamily: 'system-ui, sans-serif', pointerEvents: 'none',
        opacity: '0', transition: 'opacity 0.3s, transform 0.3s',
        whiteSpace: 'pre-line', textAlign: 'center', maxWidth: '90%'
    });

    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translate(-50%, -10px)'; });

    setTimeout(() => {
        t.style.opacity = '0'; t.style.transform = 'translate(-50%, 0)';
        setTimeout(() => t.remove(), 300);
    }, 4000); 
}

// --- 4. CLIPBOARD & UTILITY ---
function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => showToast("Copiato: " + text));
}
function pad(n) { return n < 10 ? '0' + n : n; }

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
   6. GESTORE AGGIORNAMENTI PWA (Solo Smartphone)
   ========================================= */
(function() {
    // SE SIAMO SU PC, USCIAMO SUBITO DALLA FUNZIONE (Nessun banner)
    if (!isMobileDevice()) return; 

    const currentSavedVersion = localStorage.getItem('lk_tool_version');
    const path = window.location.pathname;
    const isHomePage = path.endsWith('/') || path.includes('index.html') || path.includes('homepage');

    window.addEventListener('load', function() {
        if (typeof APP_VERSION !== 'undefined') {
            
            // A) DOPO L'AGGIORNAMENTO: Mostra le novità
            if (localStorage.getItem('lk_tool_just_updated') === 'true') {
                localStorage.removeItem('lk_tool_just_updated');
                
                const newsText = (typeof APP_NEWS !== 'undefined' && APP_NEWS) 
                    ? APP_NEWS 
                    : "Miglioramenti generali.";
                
                // Mostra il toast di conferma
                setTimeout(() => {
                    showToast(`🎉 Aggiornato alla v${APP_VERSION}!\n${newsText}`);
                }, 500);
                
                localStorage.setItem('lk_tool_version', APP_VERSION);
                return; 
            }

            // B) CONTROLLO NUOVA VERSIONE
            if (!currentSavedVersion) {
                localStorage.setItem('lk_tool_version', APP_VERSION);
            } 
            else if (APP_VERSION !== currentSavedVersion) {
                // Mostra banner SOLO in Home
                if (isHomePage) {
                    _mostraBannerAggiornamento(APP_VERSION);
                }
            }
        }
    });

    function _mostraBannerAggiornamento(newVer) {
        if (document.getElementById('pwa-update-banner')) return;

        const div = document.createElement('div');
        div.id = 'pwa-update-banner';
        div.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            width: 90%; max-width: 400px;
            background: rgba(16, 185, 129, 0.98); /* Verde Smeraldo */
            border: 2px solid #fff;
            border-radius: 16px;
            color: white; 
            padding: 16px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.6); 
            z-index: 99999;
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            font-family: sans-serif; cursor: pointer;
        `;
        
        div.innerHTML = `
            <div style="flex:1; text-align:left;">
                <div style="font-weight:800; font-size:15px; text-transform:uppercase; letter-spacing:0.5px;">
                    🚀 Update v${newVer}
                </div>
                <div style="font-size:12px; opacity:0.95; margin-top:2px;">
                    Nuova versione disponibile.
                </div>
            </div>
            <button id="btnReloadPWA" style="
                background: #fff; color: #10b981; border: none; 
                padding: 8px 16px; border-radius: 50px; 
                font-weight: 800; font-size: 13px; cursor: pointer;
                text-transform: uppercase; box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            ">
                AGGIORNA
            </button>
        `;

        div.onclick = function() {
            localStorage.setItem('lk_tool_version', newVer);
            localStorage.setItem('lk_tool_just_updated', 'true');
            window.location.reload();
        };
        
        document.body.appendChild(div);
    }
})();
