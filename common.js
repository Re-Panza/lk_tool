/* L&K Tools - Common Functions 
   Gestisce: AI, Toast Notifications, Clipboard, Utility, Math, PWA Updates, Intro Animation
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

// --- 3. TOAST MESSAGE (Notifiche a scomparsa) ---
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
        whiteSpace: 'pre-line', // Permette di andare a capo con \n
        textAlign: 'center',
        maxWidth: '90%'
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
    }, 4000); // 4 secondi per leggere bene
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
   6. GESTORE AGGIORNAMENTI PWA (Solo Homepage)
   ========================================= */
(function() {
    const currentSavedVersion = localStorage.getItem('lk_tool_version');
    const path = window.location.pathname;
    // Identifica se siamo in Homepage
    const isHomePage = path.endsWith('/') || path.includes('index.html') || path.includes('homepage');

    window.addEventListener('load', function() {
        if (typeof APP_VERSION !== 'undefined') {
            
            // A) DOPO L'AGGIORNAMENTO: Mostra le novità
            if (localStorage.getItem('lk_tool_just_updated') === 'true') {
                localStorage.removeItem('lk_tool_just_updated');
                
                const newsText = (typeof APP_NEWS !== 'undefined' && APP_NEWS) 
                    ? APP_NEWS 
                    : "Miglioramenti generali.";
                
                setTimeout(() => {
                    showToast(`🎉 Aggiornato alla v${APP_VERSION}!\n${newsText}`);
                }, 1000); // Aspetta che finisca l'intro
                
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
            background: rgba(16, 185, 129, 0.98);
            border: 2px solid #fff;
            border-radius: 16px;
            color: white; 
            padding: 16px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.6); 
            backdrop-filter: blur(8px);
            z-index: 99999;
            display: flex; align-items: center; justify-content: space-between; gap: 10px;
            animation: slideUp 0.5s ease-out;
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

/* =========================================
   7. LIVE INTRO ANIMATION (Re Panza + Zoom)
   ========================================= */
(function() {
    // Configurazione Immagine
    const INTRO_IMAGE = 're_panza_intro.png'; 
    const FORCE_INTRO = false; // Metti 'true' per testare sempre

    window.addEventListener('load', function() {
        const hasSeen = sessionStorage.getItem('lk_intro_played');
        const path = window.location.pathname;
        const isHome = path.endsWith('/') || path.includes('index.html') || path.includes('homepage');

        // Esegue l'intro solo in Home e solo una volta per sessione
        if ((!hasSeen || FORCE_INTRO) && isHome) {
            runLiveIntro();
        }
    });

    function runLiveIntro() {
        // Stile per lo zoom della pagina sottostante
        const style = document.createElement('style');
        style.innerHTML = `
            body {
                transition: transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease;
                transform-origin: center 30vh;
                transform: scale(0.6);
                opacity: 0;
                overflow: hidden;
            }
            body.intro-zoom-active {
                transform: scale(1);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        // Overlay scuro
        const overlay = document.createElement('div');
        overlay.id = 'intro-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #0f172a; 
            z-index: 999999;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            transition: opacity 0.8s ease;
        `;

        // Contenuto Overlay (Re Panza)
        overlay.innerHTML = `
            <div style="text-align:center; animation: float 3s ease-in-out infinite;">
                <img src="${INTRO_IMAGE}" 
                     onerror="this.src='icona.png'" 
                     style="width: 220px; max-width: 60%; drop-shadow: 0 0 30px rgba(96,165,250,0.6); margin-bottom: 20px;">
                
                <h2 style="
                    color: #fbbf24; font-family: system-ui; font-size: 24px; 
                    margin: 0; text-transform: uppercase; letter-spacing: 2px;
                    text-shadow: 0 4px 10px rgba(0,0,0,0.5);
                ">Benvenuto al Castello!</h2>
                
                <p style="color: #94a3b8; margin-top: 10px; font-size: 14px;">Preparazione sala di guerra...</p>
            </div>
            <style>
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
            </style>
        `;

        document.body.appendChild(overlay);

        // Sequenza temporale
        setTimeout(() => {
            // 1.8s: Via overlay, Zoom pagina
            setTimeout(() => {
                overlay.style.opacity = '0';
                document.body.classList.add('intro-zoom-active');
                
                // Pulizia finale
                setTimeout(() => {
                    overlay.remove();
                    document.body.style.overflow = '';
                    style.remove();
                    document.body.style.transform = '';
                    document.body.style.opacity = '';
                    sessionStorage.setItem('lk_intro_played', 'true');
                }, 1000);

            }, 1800); 
        }, 100);
    }
})();
