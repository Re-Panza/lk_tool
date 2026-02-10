/* L&K Tools - Common Functions 
   Gestisce: AI, Toast, Clipboard, Utility, Math, Aggiornamenti PWA
   PLUS: Sponsor Interstitial (Pubblicità Re Panza) - Mobile Optimized
*/

// --- CONFIGURAZIONE SPONSOR ---
const SPONSOR_CONFIG = {
    // URL dell'immagine
    imgUrl: 'https://re-panza.github.io/lk_tool/repanzapubli.png', 
    paypalUrl: 'https://paypal.me/Longo11',
    duration: 10000 // 10 secondi
};

// --- 0. RILEVATORE DISPOSITIVO ---
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

// --- 3. TOAST MESSAGE ---
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
   6. GESTORE AGGIORNAMENTI PWA
   ========================================= */
(function() {
    if (!isMobileDevice()) return; 

    const currentSavedVersion = localStorage.getItem('lk_tool_version');
    const path = window.location.pathname;
    const isHomePage = path.endsWith('/') || path.includes('index.html') || path.includes('homepage');

    window.addEventListener('load', function() {
        if (typeof APP_VERSION !== 'undefined') {
            if (localStorage.getItem('lk_tool_just_updated') === 'true') {
                localStorage.removeItem('lk_tool_just_updated');
                const newsText = (typeof APP_NEWS !== 'undefined' && APP_NEWS) ? APP_NEWS : "Miglioramenti generali.";
                setTimeout(() => { showToast(`🎉 Aggiornato alla v${APP_VERSION}!\n${newsText}`); }, 500);
                localStorage.setItem('lk_tool_version', APP_VERSION);
                return; 
            }
            if (!currentSavedVersion) {
                localStorage.setItem('lk_tool_version', APP_VERSION);
            } else if (APP_VERSION !== currentSavedVersion && isHomePage) {
                _mostraBannerAggiornamento(APP_VERSION);
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
            background: rgba(16, 185, 129, 0.98); border: 2px solid #fff; border-radius: 16px;
            color: white; padding: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); 
            z-index: 99999; display: flex; align-items: center; justify-content: space-between; gap: 10px;
            font-family: sans-serif; cursor: pointer;
        `;
        div.innerHTML = `
            <div style="flex:1; text-align:left;">
                <div style="font-weight:800; font-size:15px;">🚀 Update v${newVer}</div>
                <div style="font-size:12px; opacity:0.95;">Nuova versione disponibile.</div>
            </div>
            <button style="background: #fff; color: #10b981; border: none; padding: 8px 16px; border-radius: 50px; font-weight: 800; font-size: 13px;">AGGIORNA</button>
        `;
        div.onclick = function() {
            localStorage.setItem('lk_tool_version', newVer);
            localStorage.setItem('lk_tool_just_updated', 'true');
            window.location.reload();
        };
        document.body.appendChild(div);
    }
})();

// --- 9. HELPER HABITAT ---
function getHabitatInfo(t) {
    if (t === 2) return { type: 'fortezza', icon: '🏰', label: 'Fortezza' };
    if (t === 4) return { type: 'citta', icon: '🏙️', label: 'Città' };
    if (t > 4) return { type: 'metro', icon: '🏛️', label: 'Metropoli' };
    return { type: 'castello', icon: '🛖', label: 'Castello' };
}

// --- 10. PARSING AVANZATO ---
function parseInputLink(url) {
    let mPlayer = url.match(/player\?(\d+)&(\d+)/);
    if (mPlayer) return { type: 'player', id: parseInt(mPlayer[1]), w: mPlayer[2] };
    let mCoord = url.match(/coordinates\?(\d+),(\d+)&(\d+)/);
    if (mCoord) return { type: 'coord', x: parseInt(mCoord[1]), y: parseInt(mCoord[2]), w: mCoord[3] };
    return null;
}

/* =========================================
   11. SISTEMA SPONSOR RE PANZA (Interstitial)
   ========================================= */
function createSponsorOverlay() {
    if (document.getElementById('sponsor-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sponsor-overlay';
    // Stile Overlay Fullscreen
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.98); z-index: 100000;
        display: none; flex-direction: column; align-items: center; justify-content: center;
        color: #fff; text-align: center; backdrop-filter: blur(10px);
    `;

    overlay.innerHTML = `
        <div style="
            position: relative; 
            width: 90%; 
            max-width: 380px; 
            max-height: 90vh;
            padding: 20px; 
            border: 1px solid rgba(251, 191, 36, 0.3); 
            border-radius: 20px; 
            background: rgba(17, 28, 51, 0.95); 
            box-shadow: 0 20px 50px rgba(0,0,0,0.8);
            display: flex; 
            flex-direction: column;
            align-items: center;
        ">
            
            <div id="sponsor-counter-box" style="
                position: absolute; top: 10px; right: 10px;
                width: 36px; height: 36px; border-radius: 50%;
                background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                display: flex; align-items: center; justify-content: center;
                font-size: 14px; font-weight: bold; color: #fbbf24;
                z-index: 2;
            ">10</div>

            <div id="sponsor-close-btn" style="
                position: absolute; top: 10px; right: 10px;
                width: 40px; height: 40px; border-radius: 50%;
                background: #fbbf24; color: #000; cursor: pointer;
                display: none; align-items: center; justify-content: center;
                font-size: 22px; font-weight: bold; box-shadow: 0 0 15px rgba(251,191,36,0.6);
                z-index: 3;
            ">✕</div>

            <h2 style="color: #fbbf24; margin: 5px 0 15px 0; font-size: 20px; text-transform: uppercase; font-weight: 800;">
                Supporta il Re! 👑
            </h2>
            
            <div style="
                width: 100%; 
                height: 250px; /* Altezza fissa di base */
                max-height: 40vh; /* Max 40% altezza schermo per mobile */
                background: #000; 
                border-radius: 12px; 
                margin-bottom: 15px; 
                border: 2px solid #334155;
                display: flex; 
                align-items: center; 
                justify-content: center;
                overflow: hidden;
            ">
                <img src="${SPONSOR_CONFIG.imgUrl}" style="
                    width: 100%; 
                    height: 100%; 
                    object-fit: contain; /* FONDAMENTALE: Mostra immagine intera */
                ">
            </div>

            <p style="margin-bottom: 15px; color: #94a3b8; font-size: 13px; line-height: 1.4;">
                I server costano e il Re ha sete.<br>Offri un caffè per mantenere il tool attivo!
            </p>

            <a href="${SPONSOR_CONFIG.paypalUrl}" target="_blank" style="
                display: block; width: 100%; padding: 14px; 
                background: #0070ba; color: #fff; 
                text-decoration: none; font-weight: 800; border-radius: 12px; 
                box-shadow: 0 4px 15px rgba(0, 112, 186, 0.4); 
                text-transform: uppercase; letter-spacing: 0.5px;
                font-size: 14px;
                transition: transform 0.2s;
            " onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
                ☕ Offrimi un Caffè
            </a>
        </div>

        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: rgba(255,255,255,0.1);">
            <div id="sponsor-progress" style="width: 0%; height: 100%; background: #fbbf24; transition: width 1s linear;"></div>
        </div>
    `;
    document.body.appendChild(overlay);
}

window.runWithSponsor = function(callback) {
    createSponsorOverlay();
    
    const overlay = document.getElementById('sponsor-overlay');
    const countBox = document.getElementById('sponsor-counter-box');
    const closeBtn = document.getElementById('sponsor-close-btn');
    const progress = document.getElementById('sponsor-progress');
    
    // Reset stato
    let seconds = SPONSOR_CONFIG.duration / 1000;
    countBox.innerText = seconds;
    countBox.style.display = 'flex';
    closeBtn.style.display = 'none';
    progress.style.width = '0%';
    progress.style.transition = `width ${seconds}s linear`;
    
    overlay.style.display = 'flex';

    // Avvia animazione barra
    requestAnimationFrame(() => {
        progress.style.width = '100%';
    });

    const timer = setInterval(() => {
        seconds--;
        countBox.innerText = seconds;

        if (seconds <= 0) {
            clearInterval(timer);
            // Fine timer: mostra la X
            countBox.style.display = 'none';
            closeBtn.style.display = 'flex';
            
            // L'utente deve cliccare la X per procedere
            closeBtn.onclick = function() {
                overlay.style.display = 'none';
                if (callback) callback();
            };
        }
    }, 1000);
};

// Intercetta automaticamente TUTTI i link di navigazione
document.addEventListener('DOMContentLoaded', () => {
    createSponsorOverlay(); // Pre-load HTML
    
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        // Filtra link interni/esterni sicuri
        if (!href || href.startsWith('#') || href.includes('javascript') || href.includes('paypal') || link.target === '_blank') return;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.runWithSponsor(() => {
                window.location.href = href;
            });
        });
    });
});
