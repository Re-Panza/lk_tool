/* L&K Tools - Common Functions 
   Include: AI, Toast, Utility, PWA
   PLUS: Blocco PC con QR Code (Bypass: ?dev=true)
   PLUS: Intro "Caricamento" con Cosciotto & Sponsor Clean
*/

// --- CONFIGURAZIONE ASSETS ---
const ASSETS_CONFIG = {
    sponsorImg: 'https://re-panza.github.io/lk_tool/repanzapubli.png',
    introImg: 'https://re-panza.github.io/lk_tool/re%20panza%20intro.png',
    paypalUrl: 'https://paypal.me/Longo11',
    sponsorDuration: 10000, // 10 secondi di attesa
    introDuration: 4000,    // 4 secondi intro (più rapida)
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

// --- LOGICA SPONSOR (STATICO & CLEAN) ---
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
    // Overlay scuro ma leggermente trasparente per profondità
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 10, 10, 0.99); z-index: 100000; display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center; font-family: sans-serif;`;
    
    overlay.innerHTML = `
        <div style="font-size: 20px; color: #fbbf24; margin-bottom: 15px; font-weight: bold; letter-spacing: 1px;">
            ⏳ Attendi: <span id="sponsor-timer">10</span>s
        </div>
        
        <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 25px;">
            <img src="${ASSETS_CONFIG.sponsorImg}" style="
                max-width: 95%; 
                max-height: 65vh; 
                object-fit: contain; 
                border-radius: 8px;
                /* Nessun bordo, nessuna ombra colorata */
            ">
        </div>

        <a href="${ASSETS_CONFIG.paypalUrl}" target="_blank" style="
            padding: 14px 35px; background: #0070ba; color: #fff; text-decoration: none; 
            border-radius: 50px; font-weight: bold; font-size: 16px; 
            box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 10px;
            transform: scale(1); transition: transform 0.2s;
        ">
            ☕ Offrimi un Caffè
        </a>

        <div id="sponsor-close-btn" style="
            margin-top: 30px; width: 50px; height: 50px; border-radius: 50%; 
            background: rgba(255,255,255,0.1); color: #fff; border: 1px solid #fff;
            display: none; align-items: center; justify-content: center; 
            font-size: 24px; cursor: pointer; font-weight: lighter;
        ">✕</div>
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

// --- INTRO CARICAMENTO (Cosciotto Sincronizzato) ---
function runIntro() {
    if (sessionStorage.getItem('repanza_intro_shown')) return;
    
    const intro = document.createElement('div');
    intro.id = 'repanza-intro';
    intro.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:200000;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.5s;`;
    
    // Calcolo durata transizione CSS
    const animDuration = ASSETS_CONFIG.introDuration / 1000; // in secondi

    intro.innerHTML = `
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1; display:flex; align-items:center; justify-content:center;">
            <img src="${ASSETS_CONFIG.introImg}" style="width:100%; height:100%; object-fit: contain; opacity:0.8;">
        </div>
        
        <div style="position:absolute; bottom:60px; left:50%; transform:translateX(-50%); width:80%; max-width:350px; z-index:10; text-align:center;">
            <div style="color:#fbbf24; font-family: sans-serif; font-size:16px; margin-bottom:20px; font-weight:bold; letter-spacing: 3px; text-transform: uppercase;">
                CARICAMENTO...
            </div>
            
            <div style="width:100%; height:8px; background:rgba(255,255,255,0.2); border-radius:10px; position:relative; overflow: visible;">
                <div id="intro-bar" style="
                    width:0%; height:100%; background:#fbbf24; border-radius:10px; 
                    transition: width ${animDuration}s linear;
                    box-shadow: 0 0 10px #fbbf24;
                "></div>
                
                <div id="intro-chicken" style="
                    position: absolute; top: -35px; left: 0%; 
                    font-size: 32px; 
                    transform: translateX(-50%) rotate(20deg); 
                    transition: left ${animDuration}s linear;
                    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.8));
                ">🍗</div>
            </div>
        </div>
    `;
    document.body.appendChild(intro);
    
    // Start Animazione
    requestAnimationFrame(() => {
        setTimeout(() => { 
            if(document.getElementById('intro-bar')) {
                document.getElementById('intro-bar').style.width = '100%'; 
                document.getElementById('intro-chicken').style.left = '100%';
            }
        }, 100);
    });

    // Chiusura
    setTimeout(() => {
        intro.style.opacity = '0';
        setTimeout(() => { 
            intro.remove(); 
            sessionStorage.setItem('repanza_intro_shown', 'true'); 
        }, 500);
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

    // 3. Intercetta click su Game Cards
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
});
