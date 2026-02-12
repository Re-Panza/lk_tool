/* L&K Tools - Common Functions 
   Include: AI, Toast, Utility, PWA
   PLUS: Blocco PC con QR Code (Bypass: ?dev=true)
   PLUS: Intro Animata & Sponsor Statico (No Minigioco)
*/

// --- CONFIGURAZIONE ASSETS ---
const ASSETS_CONFIG = {
    sponsorImg: 'https://re-panza.github.io/lk_tool/repanzapubli.png',
    introImg: 'https://re-panza.github.io/lk_tool/re%20panza%20intro.png',
    paypalUrl: 'https://paypal.me/Longo11',
    sponsorDuration: 10000, // 10 secondi di attesa
    introDuration: 5000,    // 5 secondi intro
    adCooldown: 300000      // 5 MINUTI
};

const VIP_CODES = ['REPANZA-KING', 'CAFFE-PAGATO', 'VIP-2025'];

// --- 0. RILEVATORE DISPOSITIVO & BLOCCO PC ---
const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
const isDevMode = () => window.location.href.includes('?dev=true');

if (!isMobileDevice() && !isDevMode()) {
    document.addEventListener("DOMContentLoaded", function() {
        const currentUrl = window.location.href;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=fbbf24&bgcolor=0f172a&data=${encodeURIComponent(currentUrl)}`;
        document.body.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#0f172a; color:#e2e8f0; display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:999999; text-align:center; font-family: sans-serif; padding: 20px;">
                <h1 style="font-size:32px; margin:0 0 10px 0; color:#fbbf24;">⛔ Solo Mobile</h1>
                <p style="font-size:16px; color:#94a3b8; margin-bottom:30px;">Questa esperienza è progettata per smartphone.<br>Inquadra il QR Code per entrare:</p>
                <div style="padding:15px; background:#1e293b; border: 2px solid #fbbf24; border-radius: 20px;">
                    <img src="${qrUrl}" style="width:250px; height:250px; display:block; border-radius:10px;">
                </div>
            </div>
        `;
    });
    throw new Error("Blocco PC Attivo");
}

// --- UTILITY ---
function showToast(msg) {
    const ex = document.querySelector('.toast'); if(ex) ex.remove();
    let t = document.createElement("div"); t.className = "toast"; t.innerText = msg;
    Object.assign(t.style, {
        position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)',
        background:'rgba(52, 211, 153, 0.95)', color:'#000', padding:'12px 24px',
        borderRadius:'50px', fontWeight:'bold', zIndex:'10000', pointerEvents:'none',
        transition:'0.3s', opacity:'0'
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => t.style.opacity='1');
    setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 3000);
}

function isUserVip() { return localStorage.getItem('repanza_is_vip') === 'true'; }

// --- LOGICA SPONSOR (STATICO) ---
let currentGameCallback = null;
let sponsorInterval = null;

function shouldShowAd() {
    if (isUserVip() || isDevMode()) return false;
    const lastAdTime = parseInt(localStorage.getItem('repanza_last_ad_time') || 0);
    if (Date.now() - lastAdTime < ASSETS_CONFIG.adCooldown) return false;
    localStorage.setItem('repanza_last_ad_time', Date.now());
    return true;
}

function createSponsorOverlay() {
    if (document.getElementById('sponsor-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'sponsor-overlay';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.98); z-index: 100000; display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-family: sans-serif;`;
    overlay.innerHTML = `
        <div style="font-size: 20px; color: #fbbf24; margin-bottom: 20px; font-weight: bold;">
            ⏳ Attendi: <span id="sponsor-timer">10</span>s
        </div>
        
        <div style="position: relative; margin-bottom: 30px;">
            <img src="${ASSETS_CONFIG.sponsorImg}" style="max-width: 85%; max-height: 50vh; border-radius: 15px; border: 3px solid #fbbf24; box-shadow: 0 0 20px rgba(251,191,36,0.2);">
        </div>

        <a href="${ASSETS_CONFIG.paypalUrl}" target="_blank" style="
            padding: 15px 30px; background: #0070ba; color: #fff; text-decoration: none; 
            border-radius: 50px; font-weight: bold; font-size: 16px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 10px;
        ">
            ☕ Offrimi un Caffè
        </a>

        <div id="sponsor-close-btn" style="
            margin-top: 40px; width: 60px; height: 60px; border-radius: 50%; 
            background: #34d399; color: #0f172a; display: none; align-items: center; 
            justify-content: center; font-size: 28px; cursor: pointer; font-weight: bold;
            box-shadow: 0 0 20px rgba(52, 211, 153, 0.6); animation: pulse 1.5s infinite;
        ">✕</div>
        <style>@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }</style>
    `;
    document.body.appendChild(overlay);
}

window.runWithSponsor = function(callback) {
    if (!shouldShowAd()) { if (callback) callback(); return; }
    
    currentGameCallback = callback;
    createSponsorOverlay();
    
    const overlay = document.getElementById('sponsor-overlay');
    const timerDisplay = document.getElementById('sponsor-timer');
    const closeBtn = document.getElementById('sponsor-close-btn');
    
    overlay.style.display = 'flex';
    closeBtn.style.display = 'none';
    
    let seconds = ASSETS_CONFIG.sponsorDuration / 1000;
    timerDisplay.innerText = seconds;
    
    if (sponsorInterval) clearInterval(sponsorInterval);
    sponsorInterval = setInterval(() => {
        seconds--;
        timerDisplay.innerText = seconds;
        if (seconds <= 0) {
            clearInterval(sponsorInterval);
            timerDisplay.innerText = "0";
            closeBtn.style.display = 'flex';
        }
    }, 1000);
    
    closeBtn.onclick = function() {
        overlay.style.display = 'none';
        if (currentGameCallback) currentGameCallback();
        currentGameCallback = null;
    };
};

// --- INTRO RE PANZA (CARICAMENTO) ---
function runIntro() {
    if (sessionStorage.getItem('repanza_intro_shown')) return;
    
    const intro = document.createElement('div');
    intro.id = 'repanza-intro';
    intro.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:200000;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.8s;`;
    
    intro.innerHTML = `
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;">
            <img src="${ASSETS_CONFIG.introImg}" style="width:100%;height:100%;object-fit:cover;opacity:0.8;">
        </div>
        <div style="position:absolute;bottom:50px;left:10%;width:80%;z-index:10;text-align:center;">
            <div style="color:#fbbf24;font-family:monospace;font-size:18px;margin-bottom:15px;font-weight:bold;text-shadow: 0 2px 4px rgba(0,0,0,0.8); letter-spacing: 2px;">
                CARICAMENTO RE PANZA...
            </div>
            <div style="width:100%;height:12px;background:rgba(255,255,255,0.2);border-radius:6px;position:relative;border:1px solid rgba(255,255,255,0.3);">
                <div id="intro-bar" style="width:0%;height:100%;background:#fbbf24;border-radius:6px;transition:width 4.5s linear; box-shadow: 0 0 15px #fbbf24;"></div>
                <div id="intro-chicken" style="position:absolute;top:-35px;left:0%;font-size:32px;transition:left 4.5s linear; transform: translateX(-50%); filter: drop-shadow(0 4px 4px rgba(0,0,0,0.5));">🍗</div>
            </div>
        </div>
    `;
    document.body.appendChild(intro);
    
    // Animazione barra
    setTimeout(() => { 
        if(document.getElementById('intro-bar')) {
            document.getElementById('intro-bar').style.width = '100%'; 
            document.getElementById('intro-chicken').style.left = '100%';
        }
    }, 100);

    // Rimozione
    setTimeout(() => {
        intro.style.opacity = '0';
        setTimeout(() => { 
            intro.remove(); 
            sessionStorage.setItem('repanza_intro_shown', 'true'); 
        }, 800);
    }, ASSETS_CONFIG.introDuration);
}

// --- INIT LISTENER ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Avvia Intro
    runIntro();

    // 2. Intercetta click sui link
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.includes('javascript') || href.includes('paypal') || link.target === '_blank') return;
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.runWithSponsor(() => { window.location.href = href; });
        });
    });

    // 3. Intercetta click su Game Cards (se presenti)
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        const originalClick = card.getAttribute('onclick');
        if (originalClick) {
            card.removeAttribute('onclick');
            card.addEventListener('click', () => {
                window.runWithSponsor(() => { eval(originalClick); });
            });
        }
    });

    // 4. Controllo automatico navigazione (opzionale: se l'utente sta fermo troppo a lungo)
    setInterval(() => {
        // Se vuoi che la pubblicità appaia anche stando fermi, togli il commento sotto:
        // if (shouldShowAd()) window.runWithSponsor();
    }, 30000);
});
