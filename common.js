/* L&K Tools - Common Functions 
   Include: AI, Toast, Clipboard, Utility, Math, PWA
   PLUS: Blocco PC con QR Code
   PLUS: Sponsor & Gioco Cosciotto + Gattini (Versione Caos)
   PLUS: Classifica Online Intelligente
*/

// --- 0. RILEVATORE DISPOSITIVO ---
const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;

// --- 🛑 BLOCCO PC CON QR CODE AUTOMATICO 🛑 ---
if (!isMobileDevice()) {
    document.addEventListener("DOMContentLoaded", function() {
        // Genera QR Code dell'URL corrente
        const currentUrl = window.location.href;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=fbbf24&bgcolor=0f172a&data=${encodeURIComponent(currentUrl)}`;
        
        document.body.innerHTML = `
            <div style="
                position:fixed; top:0; left:0; width:100%; height:100%; 
                background:#0f172a; color:#e2e8f0; display:flex; flex-direction:column; 
                align-items:center; justify-content:center; z-index:999999; text-align:center;
                font-family: system-ui, -apple-system, sans-serif; padding: 20px;
            ">
                <h1 style="font-size:32px; margin:0 0 10px 0; color:#fbbf24; text-transform:uppercase; letter-spacing:1px;">⛔ Solo Mobile</h1>
                <p style="font-size:16px; color:#94a3b8; max-width:450px; line-height:1.6; margin-bottom:30px;">
                    L'esperienza di Re Panza è progettata esclusivamente per smartphone.<br>
                    Inquadra il QR Code qui sotto per aprire questo strumento sul tuo telefono:
                </p>
                <div style="padding:15px; background:#1e293b; border: 2px solid #fbbf24; border-radius: 20px; box-shadow: 0 0 40px rgba(251, 191, 36, 0.2);">
                    <img src="${qrUrl}" style="width:250px; height:250px; display:block; border-radius:10px;">
                </div>
                <p style="margin-top:20px; font-size:12px; opacity:0.5;">L&K Tools - Re Panza Edition</p>
            </div>
        `;
    });
    // Blocca l'esecuzione del resto
    throw new Error("Accesso da PC bloccato. Passare a mobile.");
}

// --- CONFIGURAZIONE ASSETS ---
const ASSETS_CONFIG = {
    sponsorImg: 'https://re-panza.github.io/lk_tool/repanzapubli.png',
    introImg: 'https://re-panza.github.io/lk_tool/re%20panza%20intro.png',
    paypalUrl: 'https://paypal.me/Longo11',
    // LINK DEL DATABASE GOOGLE
    dbUrl: 'https://script.google.com/macros/s/AKfycbzIha222zww1To2Dufz7sROIPKRUTLaUtgEWv202eOrvXzzhqGXGyJvVQKFnfwb_BjOMQ/exec', 
    
    sponsorDuration: 10000, 
    introDuration: 5000,    
    adCooldown: 300000 // 5 MINUTI (300.000 ms)
};

const VIP_CODES = ['REPANZA-KING', 'CAFFE-PAGATO', 'VIP-2025'];

// --- 1. UTILITY BASE (Non Cancellare!) ---
function getDist(x1, y1, x2, y2) {
    let cy1 = y1, cz1 = x1 - Math.floor(y1/2), cx1 = -cy1 - cz1;
    let cy2 = y2, cz2 = x2 - Math.floor(y2/2), cx2 = -cy2 - cz2;
    return Math.max(Math.abs(cx1-cx2), Math.abs(cy1-cy2), Math.abs(cz1-cz2));
}

// --- 2. PARSING LINK (Non Cancellare!) ---
function parseInputLink(url) {
    if (!url) return null;
    let mPlayer = url.match(/player\?(\d+)&(\d+)/);
    if (mPlayer) return { type: 'player', id: parseInt(mPlayer[1]), w: mPlayer[2] };
    let mCoord = url.match(/coordinates\?(\d+),(\d+)&(\d+)/);
    if (mCoord) return { type: 'coord', x: parseInt(mCoord[1]), y: parseInt(mCoord[2]), w: mCoord[3] };
    return null;
}
function parseLKLink(url) { return parseInputLink(url); }

// --- 3. HELPER HABITAT (Non Cancellare!) ---
function getHabitatInfo(t) {
    if (t === 2) return { type: 'fortezza', icon: '🏰', label: 'Fortezza' };
    if (t === 4) return { type: 'citta', icon: '🏙️', label: 'Città' };
    if (t > 4) return { type: 'metro', icon: '🏛️', label: 'Metropoli' };
    return { type: 'castello', icon: '🛖', label: 'Castello' };
}

// --- 4. TOAST & COPY ---
function copyToClipboard(text) {
    if(!text) return; navigator.clipboard.writeText(text).then(()=>showToast("Copiato: "+text));
}
function pad(n) { return n < 10 ? '0' + n : n; }

function showToast(msg, isBad=false) {
    const ex = document.querySelector('.toast'); if(ex) ex.remove();
    let t = document.createElement("div"); t.className = "toast"; t.innerText = msg;
    let bg = isBad ? 'rgba(239, 68, 68, 0.95)' : 'rgba(52, 211, 153, 0.95)';
    Object.assign(t.style, {
        position:'fixed', bottom:'90px', left:'50%', transform:'translateX(-50%)',
        background: bg, color:'#000', padding:'12px 24px',
        borderRadius:'50px', fontWeight:'bold', zIndex:'10000', pointerEvents:'none',
        transition:'0.3s', opacity:'0', textAlign:'center', maxWidth:'90%'
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => t.style.opacity='1');
    setTimeout(() => { t.style.opacity='0'; setTimeout(()=>t.remove(),300); }, 2000);
}

// --- 5. VIP & AI ---
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

function toggleAI() {
    const win = document.getElementById('ai-window'); if (!win) return;
    win.style.display = (win.style.display === 'none' || win.style.display === '') ? 'block' : 'none';
}
document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.getElementById('ai-input');
    if (aiInput) aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && typeof chiediAlRe === 'function') chiediAlRe(); });
});

/* =========================================
   LOGICA CLASSIFICA ONLINE
   ========================================= */
function getDeviceID() {
    let id = localStorage.getItem('repanza_device_id');
    if (!id) {
        id = 'player_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('repanza_device_id', id);
    }
    return id;
}

async function fetchLeaderboard() {
    try {
        const res = await fetch(ASSETS_CONFIG.dbUrl);
        const data = await res.json();
        return Array.isArray(data) ? data : fallbackLeaderboard();
    } catch (e) { return fallbackLeaderboard(); }
}

async function saveScoreToDB(name, score) {
    const uid = getDeviceID();
    const ua = navigator.userAgent;
    const url = `${ASSETS_CONFIG.dbUrl}?action=save&name=${encodeURIComponent(name)}&score=${score}&uid=${uid}&ua=${encodeURIComponent(ua)}`;
    try {
        const res = await fetch(url, { method: 'POST' });
        const data = await res.json();
        return Array.isArray(data) ? data : fallbackLeaderboard();
    } catch (e) { return fallbackLeaderboard(); }
}

function fallbackLeaderboard() {
    return [{name: "Re Panza", score: 50}, {name: "Generale", score: 40}, {name: "Soldato", score: 30}];
}

/* =========================================
   MINIGIOCO CAOTICO & SPONSOR
   ========================================= */
let gameScore = 0;
let gameInterval = null;
let gameTimeInterval = null;
let currentGameCallback = null;

function shouldShowAd() {
    // 1. VIP check
    if (isUserVip()) return false;
    // 2. Home check
    const p = window.location.pathname;
    const isHome = p.endsWith('/') || p.endsWith('index.html') || p.includes('lk_tool'); 
    if (!isHome) return false; 
    
    // 3. Cooldown 5 Minuti
    const lastAdTime = parseInt(localStorage.getItem('repanza_last_ad_time') || 0);
    if (Date.now() - lastAdTime < ASSETS_CONFIG.adCooldown) return false;
    
    localStorage.setItem('repanza_last_ad_time', Date.now());
    return true;
}

function createGameOverlay() {
    if (document.getElementById('sponsor-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'sponsor-overlay';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.98); z-index: 100000; display: none; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; user-select: none;`;
    overlay.innerHTML = `
        <div id="game-hud" style="position: absolute; top: 20px; width: 100%; display: flex; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 10;">
            <div style="color: #fbbf24; font-weight: 800; font-size: 18px; font-family: sans-serif;">⏳ <span id="game-timer">10</span>s</div>
            <div style="color: #fff; font-weight: 800; font-size: 18px; font-family: sans-serif;">PUNTI: <span id="game-score" style="color: #34d399; font-size: 22px;">0</span></div>
        </div>
        <div id="game-bg-content" style="text-align: center; opacity: 0.4; pointer-events: none; transform: scale(0.9); transition: opacity 0.5s;">
            <h2 style="color: #fbbf24; margin-bottom: 10px;">ATTESA...</h2>
            <img src="${ASSETS_CONFIG.sponsorImg}" style="max-height: 30vh; border-radius: 12px;">
            <p style="color: #ccc; margin-top: 10px;">Evita i gatti 🐱 (-1)<br>Prendi i cosciotti 🍗 (+1)</p>
        </div>
        <a href="${ASSETS_CONFIG.paypalUrl}" target="_blank" style="position: absolute; bottom: 80px; z-index: 20; padding: 12px 24px; background: #0070ba; color: #fff; text-decoration: none; font-weight: bold; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family: sans-serif; text-transform: uppercase; font-size: 14px;">☕ Offrimi un Caffè</a>
        <div id="game-close-btn" style="position: absolute; bottom: 20px; z-index: 30; width: 50px; height: 50px; border-radius: 50%; background: #fbbf24; color: #000; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; box-shadow: 0 0 20px rgba(251,191,36,0.8); animation: pulseBtn 1s infinite;">✕</div>
        <div id="game-field" style="position: absolute; top: 60px; bottom: 100px; left: 0; right: 0; z-index: 5;"></div>
        
        <div id="leaderboard-panel" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 350px; background: #1e293b; border: 2px solid #fbbf24; border-radius: 20px; padding: 20px; z-index: 50; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
            <h2 style="color:#fbbf24; margin:0 0 15px 0;">🏆 CLASSIFICA</h2>
            <div id="lb-loading" style="color:#94a3b8; font-size:12px; display:none;">Salvataggio...</div>
            <div id="new-record-input" style="display:none; margin-bottom:15px;">
                <p style="color:#fff; font-size:14px;">NUOVO RECORD: <b id="final-score-val" style="color:#34d399"></b></p>
                <input type="text" id="player-name" placeholder="Il tuo nome..." maxlength="12" style="padding: 10px; border-radius: 8px; border: 1px solid #475569; background: #0f172a; color: #fff; width: 60%; text-align: center; font-weight: bold;">
                <button onclick="submitScore()" style="padding: 10px 15px; background: #34d399; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: #0f172a;">SALVA</button>
            </div>
            <div id="score-list" style="max-height: 220px; overflow-y: auto; text-align: left; background: #0f172a; padding: 10px; border-radius: 10px; margin-bottom: 15px; font-family: monospace; font-size: 13px;"></div>
            <button id="close-lb-btn" style="width: 100%; padding: 12px; background: #fbbf24; color: #000; font-weight: 800; border: none; border-radius: 10px; cursor: pointer; text-transform: uppercase;">CONTINUA ▶</button>
        </div>
        <style>
            .game-item { position: absolute; font-size: 40px; cursor: pointer; animation: popIn 0.3s ease-out; user-select: none; }
            .game-item:active { transform: scale(0.8); }
            @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
            .score-float { position: absolute; font-weight: bold; font-size: 24px; pointer-events: none; animation: floatUp 0.8s forwards; z-index: 20; }
            @keyframes floatUp { to { transform: translateY(-50px); opacity: 0; } }
            .lb-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #334155; color: #cbd5e1; }
            .lb-row:first-child { color: #fbbf24; font-weight: bold; font-size: 1.1em; } 
            .lb-row:nth-child(2) { color: #e2e8f0; font-weight: bold; } 
            .lb-row:nth-child(3) { color: #b45309; font-weight: bold; } 
            @keyframes shake { 0% { transform: translate(1px, 1px); } 10% { transform: translate(-1px, -2px); } 20% { transform: translate(-3px, 0px); } 30% { transform: translate(3px, 2px); } 40% { transform: translate(1px, -1px); } 50% { transform: translate(-1px, 2px); } 60% { transform: translate(-3px, 1px); } 70% { transform: translate(3px, 1px); } 80% { transform: translate(-1px, -1px); } 90% { transform: translate(1px, 2px); } 100% { transform: translate(1px, -2px); } }
            .shaking { animation: shake 0.4s; border: 2px solid #ef4444; box-shadow: 0 0 20px #ef4444; }
            @keyframes pulseBtn { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        </style>
    `;
    document.body.appendChild(overlay);
}

// Genera oggetti (Cosciotti o Gattini)
function spawnGameItem() {
    const field = document.getElementById('game-field'); if (!field) return;
    
    // 25% possibilità che sia un gatto
    const isKitten = Math.random() < 0.25;
    const item = document.createElement('div'); 
    item.className = 'game-item'; 
    item.innerText = isKitten ? '🐱' : '🍗';
    
    // Posizione Random
    item.style.left = (Math.random() * 80 + 10) + '%'; 
    item.style.top = (Math.random() * 70 + 10) + '%'; 

    item.onclick = function(e) {
        e.stopPropagation();
        
        const float = document.createElement('div');
        float.className = 'score-float';
        float.style.left = item.style.left; 
        float.style.top = item.style.top;
        field.appendChild(float); 
        setTimeout(() => float.remove(), 800);

        if (isKitten) {
            // MALUS GATTO
            gameScore = Math.max(0, gameScore - 1);
            float.innerText = '-1';
            float.style.color = '#ef4444'; // Rosso
            
            // Effetto Shake e Vibrazione
            const ov = document.getElementById('sponsor-overlay');
            ov.classList.add('shaking');
            setTimeout(() => ov.classList.remove('shaking'), 400);
            if(navigator.vibrate) navigator.vibrate([100, 50, 100]); 
        } else {
            // BONUS POLLO
            gameScore++;
            float.innerText = '+1';
            float.style.color = '#34d399'; // Verde
            if(navigator.vibrate) navigator.vibrate(20); 
        }
        
        document.getElementById('game-score').innerText = gameScore;
        item.remove();
    };
    
    field.appendChild(item); 
    // Sparisce velocemente
    setTimeout(() => { if(item.parentNode) item.remove(); }, 900); 
}

// Loop di spawn caotico
function gameLoop() {
    spawnGameItem();
    // 60% chance di doppio spawn
    if(Math.random() > 0.4) setTimeout(spawnGameItem, 250);
}

window.runWithSponsor = function(callback) {
    if (!shouldShowAd()) { if (callback) callback(); return; }
    
    currentGameCallback = callback;
    createGameOverlay();
    
    document.getElementById('sponsor-overlay').style.display = 'flex';
    document.getElementById('game-hud').style.display = 'flex';
    document.getElementById('game-bg-content').style.opacity = '0.4';
    document.getElementById('leaderboard-panel').style.display = 'none';
    document.getElementById('game-field').innerHTML = '';
    
    gameScore = 0; 
    document.getElementById('game-score').innerText = '0';
    let seconds = ASSETS_CONFIG.sponsorDuration / 1000; 
    document.getElementById('game-timer').innerText = seconds;

    // Timer Partita
    gameTimeInterval = setInterval(() => { 
        seconds--; 
        document.getElementById('game-timer').innerText = seconds; 
        if (seconds <= 0) endGame(); 
    }, 1000);
    
    // Spawn Frenetico
    gameInterval = setInterval(gameLoop, 450);
};

function endGame() {
    clearInterval(gameTimeInterval); 
    clearInterval(gameInterval);
    document.getElementById('game-field').innerHTML = '';
    document.getElementById('game-hud').style.display = 'none';
    document.getElementById('game-bg-content').style.opacity = '0.1';

    const lbPanel = document.getElementById('leaderboard-panel');
    const inputDiv = document.getElementById('new-record-input');
    const closeBtn = document.getElementById('close-lb-btn');
    const loading = document.getElementById('lb-loading');
    const scoreList = document.getElementById('score-list');

    lbPanel.style.display = 'block';
    inputDiv.style.display = 'none';
    closeBtn.style.display = 'none';
    scoreList.innerHTML = '';
    loading.style.display = 'block';

    // Recupera dati locali
    const savedName = localStorage.getItem('repanza_player_name');
    const savedBest = parseInt(localStorage.getItem('repanza_best_score') || 0);

    // Se l'utente ha già un nome e ha battuto il suo record -> Salvataggio automatico
    if (savedName && gameScore > savedBest) {
        localStorage.setItem('repanza_best_score', gameScore); 
        loading.innerText = `Nuovo Record! Salvataggio...`;
        
        saveScoreToDB(savedName, gameScore).then(board => {
            loading.style.display = 'none';
            closeBtn.style.display = 'block';
            renderScores(board);
            showToast(`Record Aggiornato!`, false);
        });
    } else {
        // Altrimenti carica classifica normale
        fetchLeaderboard().then(board => {
            loading.style.display = 'none';
            const minScore = (board.length < 10) ? 0 : board[board.length - 1].score;
            
            // Se è un nuovo utente che entra in classifica
            if (gameScore > minScore && !savedName) {
                inputDiv.style.display = 'block';
                document.getElementById('final-score-val').innerText = gameScore;
            } else {
                // Niente record o punteggio basso
                closeBtn.style.display = 'block';
                renderScores(board);
            }
        });
    }

    closeBtn.onclick = function() {
        document.getElementById('sponsor-overlay').style.display = 'none';
        if (currentGameCallback) currentGameCallback();
    };
}

window.submitScore = function() {
    const nameInput = document.getElementById('player-name');
    const name = nameInput.value.trim() || "Anonimo";
    localStorage.setItem('repanza_player_name', name); 
    localStorage.setItem('repanza_best_score', gameScore);
    
    document.getElementById('new-record-input').style.display = 'none';
    document.getElementById('lb-loading').innerText = "Salvataggio...";
    document.getElementById('lb-loading').style.display = 'block';

    saveScoreToDB(name, gameScore).then(newBoard => {
        document.getElementById('lb-loading').style.display = 'none';
        document.getElementById('close-lb-btn').style.display = 'block';
        renderScores(newBoard);
    });
};

function renderScores(board) {
    const list = document.getElementById('score-list');
    list.innerHTML = board.map((entry, i) => `<div class="lb-row"><span>${i+1}. ${entry.name.substring(0,12)}</span><span>${entry.score}</span></div>`).join('');
}

// --- INTRO & INIT ---
function runIntro() {
    // Intro SOLO SU MOBILE
    if (!isMobileDevice()) return;
    
    if (sessionStorage.getItem('repanza_intro_shown')) return;
    const intro = document.createElement('div');
    intro.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:200000;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.8s;overflow:hidden;`;
    intro.innerHTML = `<div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;"><img src="${ASSETS_CONFIG.introImg}" style="width:100%;height:100%;object-fit:cover;opacity:0.9;"></div><div style="position:absolute;bottom:40px;left:10%;width:80%;z-index:10;display:flex;flex-direction:column;align-items:center;"><div style="color:#fbbf24;font-family:monospace;font-size:16px;margin-bottom:15px;text-transform:uppercase;letter-spacing:3px;font-weight:bold;text-shadow:0 2px 4px rgba(0,0,0,0.8);">Caricamento...</div><div style="position:relative;width:100%;height:10px;background:rgba(255,255,255,0.2);border-radius:5px;border:1px solid rgba(255,255,255,0.3);"><div id="intro-bar" style="width:0%;height:100%;background:linear-gradient(90deg,#fbbf24,#f59e0b);border-radius:5px;box-shadow:0 0 20px rgba(251,191,36,0.8);transition:width ${ASSETS_CONFIG.introDuration}ms linear;"></div><div id="intro-chicken" style="position:absolute;top:-35px;left:0%;font-size:32px;transition:left ${ASSETS_CONFIG.introDuration}ms linear;transform:translateX(-50%) rotate(15deg);filter:drop-shadow(0 5px 5px rgba(0,0,0,0.8));animation:bounceChicken 0.5s infinite alternate;">🍗</div></div></div><style>@keyframes bounceChicken{from{transform:translateX(-50%) rotate(15deg) translateY(0);}to{transform:translateX(-50%) rotate(25deg) translateY(-5px);}}</style>`;
    document.body.appendChild(intro);
    requestAnimationFrame(() => { setTimeout(() => { if(document.getElementById('intro-bar')) { document.getElementById('intro-bar').style.width = '100%'; document.getElementById('intro-chicken').style.left = '100%'; } }, 100); });
    setTimeout(() => { intro.style.opacity='0'; setTimeout(()=>{intro.remove();sessionStorage.setItem('repanza_intro_shown','true');},800); }, ASSETS_CONFIG.introDuration);
}

document.addEventListener('DOMContentLoaded', () => {
    runIntro(); 
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.includes('javascript') || href.includes('paypal') || link.target === '_blank') return;
        link.addEventListener('click', (e) => { e.preventDefault(); window.runWithSponsor(() => { window.location.href = href; }); });
    });
});

(function(){if(!isMobileDevice())return;const s=localStorage.getItem('lk_tool_version'),p=window.location.pathname,h=p.endsWith('/')||p.includes('index')||p.includes('home');window.addEventListener('load',function(){if(typeof APP_VERSION!=='undefined'){if(localStorage.getItem('lk_tool_just_updated')==='true'){localStorage.removeItem('lk_tool_just_updated');setTimeout(()=>showToast(`🎉 Aggiornato v${APP_VERSION}!`),500);localStorage.setItem('lk_tool_version',APP_VERSION);return}if(!s){localStorage.setItem('lk_tool_version',APP_VERSION)}else if(APP_VERSION!==s&&h){const d=document.createElement('div');d.style.cssText='position:fixed;bottom:20px;left:50%;transform:translateX(-50%);width:90%;max-width:400px;background:#10b981;border:2px solid #fff;border-radius:16px;color:#fff;padding:16px;z-index:99999;display:flex;justify-content:space-between;align-items:center;font-family:sans-serif;box-shadow:0 10px 40px rgba(0,0,0,0.6);cursor:pointer';d.innerHTML=`<div><b>🚀 Update v${APP_VERSION}</b><br><small>Nuova versione disponibile.</small></div><button style="background:#fff;color:#10b981;border:none;padding:8px 16px;border-radius:20px;font-weight:bold;">AGGIORNA</button>`;d.onclick=()=>{localStorage.setItem('lk_tool_version',APP_VERSION);localStorage.setItem('lk_tool_just_updated','true');window.location.reload()};document.body.appendChild(d)}}})})();
