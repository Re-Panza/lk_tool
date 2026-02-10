/* L&K Tools - Common Functions 
   Include: AI, Toast, Clipboard, Utility, Math, Aggiornamenti PWA
   PLUS: Sponsor Interstitial (Pubblicità Re Panza) - Frequency Control
   PLUS: Minigioco "Acchiappa il Cosciotto"
   PLUS: Intro Splash Screen
*/

// --- CONFIGURAZIONE ASSETS ---
const ASSETS_CONFIG = {
    sponsorImg: 'https://re-panza.github.io/lk_tool/repanzapubli.png',
    introImg: 'https://re-panza.github.io/lk_tool/re%20panza%20intro.png',
    paypalUrl: 'https://paypal.me/Longo11',
    sponsorDuration: 10000, // Durata gioco (10 sec)
    introDuration: 4000,    // Durata intro iniziale
    adCooldown: 60000       // 1 Minuto (60 * 1000 ms) di pausa tra una pubblicità e l'altra
};

const VIP_CODES = ['REPANZA-KING', 'CAFFE-PAGATO', 'VIP-2025'];

// --- 0. RILEVATORE DISPOSITIVO ---
const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;

// --- UTILITY BASE ---
function getDist(x1, y1, x2, y2) {
    let cy1 = y1, cz1 = x1 - Math.floor(y1/2), cx1 = -cy1 - cz1;
    let cy2 = y2, cz2 = x2 - Math.floor(y2/2), cx2 = -cy2 - cz2;
    return Math.max(Math.abs(cx1-cx2), Math.abs(cy1-cy2), Math.abs(cz1-cz2));
}
function parseLKLink(url) {
    let m = url.match(/coordinates\?(\d+),(\d+)&(\d+)/);
    return m ? { x: parseInt(m[1]), y: parseInt(m[2]), w: m[3] } : null;
}
function copyToClipboard(text) {
    if(!text) return; navigator.clipboard.writeText(text).then(()=>showToast("Copiato: "+text));
}
function pad(n) { return n < 10 ? '0' + n : n; }

// --- TOAST ---
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

// --- VIP SYSTEM ---
function isUserVip() { return localStorage.getItem('repanza_is_vip') === 'true'; }
function activateVip() {
    const code = prompt("Inserisci il tuo Codice VIP:");
    if (!code) return;
    if (VIP_CODES.includes(code.trim().toUpperCase())) {
        localStorage.setItem('repanza_is_vip', 'true');
        alert("👑 Codice Accettato! Sei VIP. Niente più attese.");
        location.reload();
    } else { alert("❌ Codice non valido."); }
}

/* =========================================
   LOGICA DI CONTROLLO FREQUENZA ADS
   ========================================= */
function shouldShowAd() {
    // 1. Se sei VIP, niente pubblicità
    if (isUserVip()) return false;

    // 2. Controllo Posizione: La pubblicità parte SOLO se sei sulla Home
    const p = window.location.pathname;
    // Verifica flessibile per Home (root, index.html, o cartella principale repo)
    const isHome = p.endsWith('/') || p.endsWith('index.html') || p.endsWith('lk_tool/');
    
    if (!isHome) return false; // Se non sei in Home, salta sempre

    // 3. Controllo Tempo: È passato 1 minuto dall'ultima volta?
    const lastAdTime = parseInt(localStorage.getItem('repanza_last_ad_time') || 0);
    const now = Date.now();

    if (now - lastAdTime < ASSETS_CONFIG.adCooldown) {
        return false; // Troppo presto, salta
    }

    // Se passa tutti i controlli, aggiorna il tempo e mostra
    localStorage.setItem('repanza_last_ad_time', now);
    return true;
}

/* =========================================
   MINIGIOCO: ACCHIAPPA IL COSCIOTTO 🍗
   ========================================= */
let gameScore = 0;
let gameInterval = null;
let gameTimeInterval = null;

function createGameOverlay() {
    if (document.getElementById('sponsor-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'sponsor-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.98); z-index: 100000;
        display: none; flex-direction: column; align-items: center; justify-content: center;
        overflow: hidden; user-select: none; -webkit-user-select: none;
    `;

    overlay.innerHTML = `
        <div style="position: absolute; top: 20px; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 10;">
            <div style="color: #fbbf24; font-weight: 800; font-size: 18px; font-family: sans-serif;">
                ⏳ <span id="game-timer">10</span>s
            </div>
            <div style="color: #fff; font-weight: 800; font-size: 18px; font-family: sans-serif;">
                PUNTI: <span id="game-score" style="color: #34d399; font-size: 22px;">0</span>
            </div>
        </div>

        <div style="text-align: center; opacity: 0.4; pointer-events: none; transform: scale(0.9);">
            <h2 style="color: #fbbf24; margin-bottom: 10px;">IN ATTESA DEL CALCOLO...</h2>
            <img src="${ASSETS_CONFIG.sponsorImg}" style="max-height: 30vh; border-radius: 12px;">
            <p style="color: #ccc; margin-top: 10px;">Inganna l'attesa: Acchiappa i cosciotti! 🍗</p>
        </div>

        <a href="${ASSETS_CONFIG.paypalUrl}" target="_blank" style="
            position: absolute; bottom: 80px; z-index: 20;
            padding: 12px 24px; background: #0070ba; color: #fff; text-decoration: none;
            font-weight: bold; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            font-family: sans-serif; text-transform: uppercase; font-size: 14px;
        ">☕ Offrimi un Caffè</a>

        <div id="game-close-btn" style="
            position: absolute; bottom: 20px; z-index: 30;
            width: 50px; height: 50px; border-radius: 50%;
            background: #fbbf24; color: #000; cursor: pointer;
            display: none; align-items: center; justify-content: center;
            font-size: 24px; font-weight: bold; box-shadow: 0 0 20px rgba(251,191,36,0.8);
            animation: pulseBtn 1s infinite;
        ">✕</div>

        <div id="game-field" style="position: absolute; top: 60px; bottom: 100px; left: 0; right: 0; z-index: 5;"></div>

        <style>
            @keyframes pulseBtn { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
            .chicken-target { 
                position: absolute; font-size: 40px; cursor: pointer; 
                transition: transform 0.1s; animation: popIn 0.3s ease-out;
            }
            .chicken-target:active { transform: scale(0.8); }
            @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
            .score-float {
                position: absolute; color: #34d399; font-weight: bold; font-size: 20px;
                pointer-events: none; animation: floatUp 0.8s ease-out forwards;
            }
            @keyframes floatUp { to { transform: translateY(-50px); opacity: 0; } }
        </style>
    `;
    document.body.appendChild(overlay);
}

function spawnChicken() {
    const field = document.getElementById('game-field');
    if (!field) return;

    const chicken = document.createElement('div');
    chicken.className = 'chicken-target';
    chicken.innerText = '🍗';
    
    // Posizione casuale
    const x = Math.random() * 80 + 10; 
    const y = Math.random() * 80 + 10;
    
    chicken.style.left = x + '%';
    chicken.style.top = y + '%';

    chicken.onclick = function(e) {
        e.stopPropagation();
        gameScore++;
        document.getElementById('game-score').innerText = gameScore;
        
        const float = document.createElement('div');
        float.className = 'score-float';
        float.innerText = '+1';
        float.style.left = chicken.style.left;
        float.style.top = chicken.style.top;
        field.appendChild(float);
        setTimeout(() => float.remove(), 800);

        if(navigator.vibrate) navigator.vibrate(50);
        chicken.remove();
    };

    field.appendChild(chicken);
    setTimeout(() => { if(chicken.parentNode) chicken.remove(); }, 1200);
}

// --- FUNZIONE PRINCIPALE: Lancio Sponsor/Gioco ---
window.runWithSponsor = function(callback) {
    // Controllo Logica (VIP, Posizione, Tempo)
    if (!shouldShowAd()) {
        // Se non deve mostrare la pubblicità, esegui subito l'azione
        if (callback) callback();
        return;
    }
    
    createGameOverlay();
    const overlay = document.getElementById('sponsor-overlay');
    const timerEl = document.getElementById('game-timer');
    const closeBtn = document.getElementById('game-close-btn');
    const scoreEl = document.getElementById('game-score');
    
    // Reset Gioco
    gameScore = 0;
    scoreEl.innerText = '0';
    let seconds = ASSETS_CONFIG.sponsorDuration / 1000;
    timerEl.innerText = seconds;
    closeBtn.style.display = 'none';
    overlay.style.display = 'flex';
    document.getElementById('game-field').innerHTML = ''; 

    // Loop Timer
    gameTimeInterval = setInterval(() => {
        seconds--;
        timerEl.innerText = seconds;
        if (seconds <= 0) {
            endGame(callback);
        }
    }, 1000);

    // Loop Spawn
    gameInterval = setInterval(spawnChicken, 500);
};

function endGame(callback) {
    clearInterval(gameTimeInterval);
    clearInterval(gameInterval);
    document.getElementById('game-field').innerHTML = ''; 
    
    const closeBtn = document.getElementById('game-close-btn');
    closeBtn.style.display = 'flex';
    
    showToast(`Tempo scaduto! Hai preso ${gameScore} cosciotti! 🍗`);

    closeBtn.onclick = function() {
        document.getElementById('sponsor-overlay').style.display = 'none';
        if (callback) callback();
    };
}

// --- INTRO SPLASH SCREEN ---
function runIntro() {
    if (sessionStorage.getItem('repanza_intro_shown')) return;
    const intro = document.createElement('div');
    intro.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:200000;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.8s;overflow:hidden;`;
    
    intro.innerHTML = `
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;">
            <img src="${ASSETS_CONFIG.introImg}" style="width:100%;height:100%;object-fit:cover;opacity:0.9;">
        </div>
        <div style="position:absolute;bottom:40px;left:10%;width:80%;z-index:10;display:flex;flex-direction:column;align-items:center;">
            <div style="color:#fbbf24;font-family:monospace;font-size:16px;margin-bottom:15px;text-transform:uppercase;letter-spacing:3px;font-weight:bold;text-shadow:0 2px 4px rgba(0,0,0,0.8);">Caricamento...</div>
            <div style="position:relative;width:100%;height:10px;background:rgba(255,255,255,0.2);border-radius:5px;border:1px solid rgba(255,255,255,0.3);">
                <div id="intro-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#fbbf24,#f59e0b);border-radius:5px;box-shadow:0 0 20px rgba(251,191,36,0.8);transition:width ${ASSETS_CONFIG.introDuration}ms linear;"></div>
                <div id="intro-chicken" style="position:absolute;top:-35px;left:0%;font-size:32px;transition:left ${ASSETS_CONFIG.introDuration}ms linear;transform:translateX(-50%) rotate(15deg);filter:drop-shadow(0 5px 5px rgba(0,0,0,0.8));animation:bounceChicken 0.5s infinite alternate;">🍗</div>
            </div>
        </div>
        <style>@keyframes bounceChicken{from{transform:translateX(-50%) rotate(15deg) translateY(0);}to{transform:translateX(-50%) rotate(25deg) translateY(-5px);}}</style>
    `;
    
    document.body.appendChild(intro);
    requestAnimationFrame(() => { 
        setTimeout(() => {
            if(document.getElementById('intro-bar')) {
                document.getElementById('intro-bar').style.width = '100%';
                document.getElementById('intro-chicken').style.left = '100%';
            }
        }, 100);
    });
    setTimeout(() => { intro.style.opacity='0'; setTimeout(()=>{intro.remove();sessionStorage.setItem('repanza_intro_shown','true');},800); }, ASSETS_CONFIG.introDuration);
}

// --- INIT GENERALE ---
document.addEventListener('DOMContentLoaded', () => {
    runIntro(); 
    createGameOverlay(); 
    
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.includes('javascript') || href.includes('paypal') || link.target === '_blank') return;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.runWithSponsor(() => { window.location.href = href; });
        });
    });
});

// Gestione PWA Update
(function(){if(!isMobileDevice())return;const s=localStorage.getItem('lk_tool_version'),p=window.location.pathname,h=p.endsWith('/')||p.includes('index')||p.includes('home');window.addEventListener('load',function(){if(typeof APP_VERSION!=='undefined'){if(localStorage.getItem('lk_tool_just_updated')==='true'){localStorage.removeItem('lk_tool_just_updated');setTimeout(()=>showToast(`🎉 Aggiornato v${APP_VERSION}!`),500);localStorage.setItem('lk_tool_version',APP_VERSION);return}if(!s){localStorage.setItem('lk_tool_version',APP_VERSION)}else if(APP_VERSION!==s&&h){const d=document.createElement('div');d.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:90%;max-width:400px;background:#10b981;border:2px solid #fff;border-radius:16px;color:#fff;padding:16px;z-index:99999;display:flex;justify-content:space-between;align-items:center;font-family:sans-serif;box-shadow:0 10px 40px rgba(0,0,0,0.6);cursor:pointer';d.innerHTML=`<div><b>🚀 Update v${APP_VERSION}</b><br><small>Nuova versione disponibile.</small></div><button style="background:#fff;color:#10b981;border:none;padding:8px 16px;border-radius:20px;font-weight:bold;">AGGIORNA</button>`;d.onclick=()=>{localStorage.setItem('lk_tool_version',APP_VERSION);localStorage.setItem('lk_tool_just_updated','true');window.location.reload()};document.body.appendChild(d)}}})})();
