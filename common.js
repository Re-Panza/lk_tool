/* L&K Tools - Common Functions 
   Gestisce: AI, Toast Notifications, Clipboard, Utility, Math, PWA Updates, Intro Animation, Page Transitions
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
        whiteSpace: 'pre-line', 
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
    }, 4000); 
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
    const isHomePage = path.endsWith('/') || path.includes('index.html') || path.includes('homepage');

    window.addEventListener('load', function() {
        if (typeof APP_VERSION !== 'undefined') {
            
            // A) DOPO L'AGGIORNAMENTO
            if (localStorage.getItem('lk_tool_just_updated') === 'true') {
                localStorage.removeItem('lk_tool_just_updated');
                
                const newsText = (typeof APP_NEWS !== 'undefined' && APP_NEWS) 
                    ? APP_NEWS 
                    : "Miglioramenti generali.";
                
                setTimeout(() => {
                    showToast(`🎉 Aggiornato alla v${APP_VERSION}!\n${newsText}`);
                }, 4500); 
                
                localStorage.setItem('lk_tool_version', APP_VERSION);
                return; 
            }

            // B) CONTROLLO NUOVA VERSIONE
            if (!currentSavedVersion) {
                localStorage.setItem('lk_tool_version', APP_VERSION);
            } 
            else if (APP_VERSION !== currentSavedVersion) {
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
   7. LIVE INTRO ANIMATION (Re Panza DX + Home Profonda)
   ========================================= */
(function() {
    const INTRO_IMAGE = 're_panza_intro.png'; 
    const FORCE_INTRO = false; 

    window.addEventListener('load', function() {
        const hasSeen = sessionStorage.getItem('lk_intro_played');
        const path = window.location.pathname;
        const isHome = path.endsWith('/') || path.includes('index.html') || path.includes('homepage');

        if ((!hasSeen || FORCE_INTRO) && isHome) {
            runLiveIntro();
        }
    });

    function runLiveIntro() {
        const style = document.createElement('style');
        style.innerHTML = `
            body {
                transition: transform 4.0s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 3.5s ease;
                transform-origin: center 50vh; 
                transform: scale(0.35); 
                opacity: 0;
                overflow: hidden;
            }
            body.intro-zoom-active {
                transform: scale(1);
                opacity: 1;
            }
        `;
        document.head.appendChild(style);

        const overlay = document.createElement('div');
        overlay.id = 'intro-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #0f172a; 
            z-index: 999999;
            display: flex; flex-direction: column;
            align-items: flex-end; 
            justify-content: flex-end; 
            padding-bottom: 0;
            transition: background-color 3.5s ease;
        `;

        const contentBox = document.createElement('div');
        contentBox.style.cssText = `
            text-align: right;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: flex-end; 
            justify-content: flex-end; 
            transition: opacity 3.0s ease-in; 
            opacity: 1;
        `;
        
        contentBox.innerHTML = `
            <img src="${INTRO_IMAGE}" 
                 onerror="this.src='icona.png'" 
                 style="
                    height: 90vh; 
                    width: auto;
                    max-width: 80vw;
                    object-fit: contain;
                    drop-shadow: -10px 0 50px rgba(96,165,250,0.3); 
                    margin-right: -20px; 
                 ">
            
            <h2 style="
                position: absolute; bottom: 5vh; right: 5vw;
                color: #fbbf24; font-family: system-ui; font-size: 24px; 
                margin: 0; text-transform: uppercase; letter-spacing: 4px;
                text-shadow: 0 4px 20px rgba(0,0,0,0.9);
                text-align: right;
            ">Benvenuto</h2>
        `;

        overlay.appendChild(contentBox);
        document.body.appendChild(overlay);

        setTimeout(() => {
            document.body.classList.add('intro-zoom-active');
            overlay.style.backgroundColor = 'rgba(15, 23, 42, 0)'; 
            contentBox.style.opacity = '0';

            setTimeout(() => {
                overlay.remove();
                document.body.style.overflow = '';
                style.remove();
                document.body.style.transform = '';
                document.body.style.opacity = '';
                sessionStorage.setItem('lk_intro_played', 'true');
            }, 4200);

        }, 200);
    }
})();

/* =========================================
   8. TRANSIAZIONE PAGINE (Elegante & Istantanea)
   ========================================= */
(function() {
    // 1. Controlla se dobbiamo riprodurre l'Intro
    const path = window.location.pathname;
    const isHome = path.endsWith('/') || path.includes('index.html') || path.includes('homepage');
    const hasSeenIntro = sessionStorage.getItem('lk_intro_played');
    const isIntroActive = isHome && !hasSeenIntro;

    // Se l'intro è attiva, NON fare nulla qui (l'intro gestisce la sua animazione)
    if (isIntroActive) return;

    // 2. Inietta Stili per l'entrata morbida
    const style = document.createElement('style');
    style.textContent = `
        /* La pagina nasce leggermente spostata e invisibile */
        @keyframes softEntry {
            from { opacity: 0; transform: translateY(15px) scale(0.99); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        /* Applica l'animazione al body */
        body {
            animation: softEntry 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
    `;
    document.head.appendChild(style);

    // 3. Hack per Safari/iOS "Tasto Indietro" (Back-Forward Cache)
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            // Riavvia l'animazione se torniamo indietro dalla cache
            document.body.style.animation = 'none';
            requestAnimationFrame(() => {
                document.body.style.animation = 'softEntry 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards';
            });
        }
    });

    // 4. (Opzionale) Se vuoi che l'uscita sia comunque un minimo percepita senza ritardi
    // Lasciamo che il click sia istantaneo, l'animazione è solo IN ENTRATA.
    // È il metodo più fluido percepito dall'utente.
})();
