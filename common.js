/* L&K Tools - Common Functions 
   Include: AI, Toast, Clipboard, Utility, Math, Aggiornamenti PWA
   PLUS: Sponsor Interstitial (Pubblicità Re Panza)
   PLUS: Intro Splash Screen (Caricamento Finto con Cosciotto)
*/

// --- CONFIGURAZIONE ASSETS ---
const ASSETS_CONFIG = {
    // Immagine Pubblicità (Sponsor)
    sponsorImg: 'https://re-panza.github.io/lk_tool/repanzapubli.png',
    // Immagine Intro (Splash Screen) - Nota: %20 sostituisce gli spazi
    introImg: 'https://re-panza.github.io/lk_tool/re%20panza%20intro.png',
    
    paypalUrl: 'https://paypal.me/Longo11',
    sponsorDuration: 10000, // 10 secondi pubblicità
    introDuration: 3500     // 3.5 secondi intro
};

// --- LISTA CODICI VIP ---
const VIP_CODES = ['REPANZA-KING', 'CAFFE-PAGATO', 'VIP-2025'];

// --- 0. RILEVATORE DISPOSITIVO ---
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
};

// --- 1. CALCOLO DISTANZA ---
function getDist(x1, y1, x2, y2) {
    let cy1 = y1; let cz1 = x1 - Math.floor(y1 / 2); let cx1 = -cy1 - cz1;
    let cy2 = y2; let cz2 = x2 - Math.floor(y2 / 2); let cx2 = -cy2 - cz2;
    return Math.max(Math.abs(cx1 - cx2), Math.abs(cy1 - cy2), Math.abs(cz1 - cz2));
}

// --- 2. PARSING LINK ---
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
    t.className = "toast"; t.innerText = msg;
    Object.assign(t.style, {
        position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(52, 211, 153, 0.95)', color: '#000', padding: '12px 24px', 
        borderRadius: '50px', fontWeight: 'bold', zIndex: '10000', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)', fontFamily: 'system-ui, sans-serif', 
        pointerEvents: 'none', opacity: '0', transition: 'opacity 0.3s, transform 0.3s',
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

// --- VIP SYSTEM ---
function isUserVip() { return localStorage.getItem('repanza_is_vip') === 'true'; }
function activateVip() {
    const code = prompt("Inserisci il tuo Codice VIP:");
    if (!code) return;
    if (VIP_CODES.includes(code.trim().toUpperCase())) {
        localStorage.setItem('repanza_is_vip', 'true');
        alert("👑 Codice Accettato! Sei VIP.");
        location.reload();
    } else { alert("❌ Codice non valido."); }
}

/* =========================================
   INTRO SPLASH SCREEN (Caricamento Finto)
   ========================================= */
function runIntro() {
    // Controlla se l'intro è già stata mostrata in questa sessione
    if (sessionStorage.getItem('repanza_intro_shown')) return;

    const intro = document.createElement('div');
    intro.id = 're-panza-intro';
    intro.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #0f172a; z-index: 200000;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        transition: opacity 0.5s ease;
    `;

    intro.innerHTML = `
        <div style="flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; padding: 20px;">
            <img src="${ASSETS_CONFIG.introImg}" style="
                max-width: 90%; max-height: 60vh; 
                object-fit: contain; 
                filter: drop-shadow(0 0 20px rgba(96, 165, 250, 0.3));
                animation: floatIntro 3s ease-in-out infinite;
            ">
        </div>

        <div style="color: #94a3b8; font-family: monospace; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">
            Caricamento Risorse...
        </div>

        <div style="position: relative; width: 100%; height: 8px; background: rgba(255,255,255,0.1);">
            <div id="intro-bar" style="
                width: 0%; height: 100%; 
                background: linear-gradient(90deg, #fbbf24, #f59e0b);
                box-shadow: 0 0 15px rgba(251, 191, 36, 0.5);
                transition: width ${ASSETS_CONFIG.introDuration}ms cubic-bezier(0.2, 1, 0.3, 1);
            "></div>
            
            <div id="intro-chicken" style="
                position: absolute; top: -28px; left: 0%; 
                font-size: 24px; 
                transition: left ${ASSETS_CONFIG.introDuration}ms cubic-bezier(0.2, 1, 0.3, 1);
                transform: translateX(-50%) rotate(20deg);
                filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));
            ">🍗</div>
        </div>
        
        <style>
            @keyframes floatIntro {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        </style>
    `;

    document.body.appendChild(intro);

    // Avvia Animazione
    requestAnimationFrame(() => {
        const bar = document.getElementById('intro-bar');
        const chicken = document.getElementById('intro-chicken');
        if (bar && chicken) {
            bar.style.width = '100%';
            chicken.style.left = '100%';
        }
    });

    // Rimuovi dopo durata
    setTimeout(() => {
        intro.style.opacity = '0';
        setTimeout(() => {
            intro.remove();
            sessionStorage.setItem('repanza_intro_shown', 'true'); // Segna come visto per questa sessione
        }, 500);
    }, ASSETS_CONFIG.introDuration);
}

/* =========================================
   SPONSOR INTERSTITIAL (Pubblicità)
   ========================================= */
function createSponsorOverlay() {
    if (document.getElementById('sponsor-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sponsor-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.98); z-index: 100000;
        display: none; flex-direction: column; align-items: center; justify-content: center;
        color: #fff; text-align: center; backdrop-filter: blur(10px);
        padding: 20px; box-sizing: border-box;
    `;

    overlay.innerHTML = `
        <div style="width: 100%; max-width: 450px; display: flex; flex-direction: column; align-items: center; position: relative;">
            <div id="sponsor-counter-box" style="position: absolute; top: -40px; right: 0; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: #fbbf24; z-index: 2;">10</div>
            <div id="sponsor-close-btn" style="position: absolute; top: -45px; right: 0; width: 44px; height: 44px; border-radius: 50%; background: #fbbf24; color: #000; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; box-shadow: 0 0 15px rgba(251,191,36,0.6); z-index: 3;">✕</div>
            <h2 style="color: #fbbf24; margin: 0 0 15px 0; font-size: 22px; text-transform: uppercase; font-weight: 800;">Supporta il Re! 👑</h2>
            <img src="${ASSETS_CONFIG.sponsorImg}" style="width: auto; max-width: 100%; max-height: 55vh; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); margin-bottom: 20px; display: block;">
            <p style="margin-bottom: 20px; color: #94a3b8; font-size: 14px; line-height: 1.4;">I server costano e il Re ha sete.<br>Offri un caffè per mantenere il tool attivo!</p>
            <a href="${ASSETS_CONFIG.paypalUrl}" target="_blank" style="display: block; width: 100%; padding: 16px; background: #0070ba; color: #fff; text-decoration: none; font-weight: 800; border-radius: 50px; box-shadow: 0 4px 20px rgba(0, 112, 186, 0.5); text-transform: uppercase; letter-spacing: 1px; font-size: 15px; transition: transform 0.2s;" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">☕ Offrimi un Caffè</a>
            <div onclick="activateVip()" style="margin-top: 15px; font-size: 12px; color: #fbbf24; text-decoration: underline; cursor: pointer; opacity: 0.8;">Hai già donato? Inserisci Codice VIP</div>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 6px; background: rgba(255,255,255,0.1);"><div id="sponsor-progress" style="width: 0%; height: 100%; background: #fbbf24; transition: width 1s linear;"></div></div>
    `;
    document.body.appendChild(overlay);
}

window.runWithSponsor = function(callback) {
    if (isUserVip()) { if (callback) callback(); return; }
    createSponsorOverlay();
    
    const overlay = document.getElementById('sponsor-overlay');
    const countBox = document.getElementById('sponsor-counter-box');
    const closeBtn = document.getElementById('sponsor-close-btn');
    const progress = document.getElementById('sponsor-progress');
    
    let seconds = ASSETS_CONFIG.sponsorDuration / 1000;
    countBox.innerText = seconds;
    countBox.style.display = 'flex';
    closeBtn.style.display = 'none';
    progress.style.width = '0%';
    progress.style.transition = `width ${seconds}s linear`;
    overlay.style.display = 'flex';

    requestAnimationFrame(() => { progress.style.width = '100%'; });

    const timer = setInterval(() => {
        seconds--;
        countBox.innerText = seconds;
        if (seconds <= 0) {
            clearInterval(timer);
            countBox.style.display = 'none';
            closeBtn.style.display = 'flex';
            closeBtn.onclick = function() {
                overlay.style.display = 'none';
                if (callback) callback();
            };
        }
    }, 1000);
};

// --- GESTORE PWA UPDATE (Mobile Only) ---
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
                // Banner Aggiornamento PWA
                if (!document.getElementById('pwa-update-banner')) {
                    const div = document.createElement('div');
                    div.id = 'pwa-update-banner';
                    div.style.cssText = 'position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: 90%; max-width: 400px; background: rgba(16, 185, 129, 0.98); border: 2px solid #fff; border-radius: 16px; color: white; padding: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); z-index: 99999; display: flex; align-items: center; justify-content: space-between; gap: 10px; font-family: sans-serif; cursor: pointer;';
                    div.innerHTML = `<div style="flex:1; text-align:left;"><div style="font-weight:800; font-size:15px;">🚀 Update v${APP_VERSION}</div><div style="font-size:12px; opacity:0.95;">Nuova versione disponibile.</div></div><button style="background: #fff; color: #10b981; border: none; padding: 8px 16px; border-radius: 50px; font-weight: 800; font-size: 13px;">AGGIORNA</button>`;
                    div.onclick = function() {
                        localStorage.setItem('lk_tool_version', APP_VERSION);
                        localStorage.setItem('lk_tool_just_updated', 'true');
                        window.location.reload();
                    };
                    document.body.appendChild(div);
                }
            }
        }
    });
})();

// --- INIT GENERALE (Link + Intro) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Avvia l'Intro (solo se serve)
    runIntro();

    // 2. Prepara la pubblicità (preload)
    createSponsorOverlay(); 
    
    // 3. Intercetta Link di navigazione
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.includes('javascript') || href.includes('paypal') || link.target === '_blank') return;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.runWithSponsor(() => {
                window.location.href = href;
            });
        });
    });
});
