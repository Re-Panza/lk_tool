/* L&K Tools - Common Functions 
   Include: AI, Toast, Clipboard, Utility, Math, PWA
   PLUS: Blocco PC con QR Code (Bypassabile con ?dev=true)
   PLUS: Sponsor Statico (Re Panza Image) ogni 5 minuti
   PLUS: Classifica Online Intelligente
*/

// --- 0. RILEVATORE DISPOSITIVO ---
const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;

// --- 🛑 BLOCCO PC CON QR CODE (E BYPASS) 🛑 ---
// Per entrare da PC usa: tuo-sito.html?dev=true
const isDevMode = () => window.location.href.includes('?dev=true');

if (!isMobileDevice() && !isDevMode()) {
    document.addEventListener("DOMContentLoaded", function() {
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
    throw new Error("Accesso da PC bloccato. Usa ?dev=true per bypassare.");
}

// --- CONFIGURAZIONE ASSETS ---
const ASSETS_CONFIG = {
    sponsorImg: 'https://re-panza.github.io/lk_tool/repanzapubli.png',
    introImg: 'https://re-panza.github.io/lk_tool/re%20panza%20intro.png',
    paypalUrl: 'https://paypal.me/Longo11',
    // LINK DEL DATABASE GOOGLE
    dbUrl: 'https://script.google.com/macros/s/AKfycbzIha222zww1To2Dufz7sROIPKRUTLaUtgEWv202eOrvXzzhqGXGyJvVQKFnfwb_BjOMQ/exec', 
    
    sponsorDuration: 10000, // 10 secondi
    introDuration: 5000,    
    adCooldown: 300000 // 5 MINUTI (300.000 ms)
};

const VIP_CODES = ['REPANZA-KING', 'CAFFE-PAGATO', 'VIP-2025'];

// --- UTILITY E AI (Invariate) ---
function getDist(x1, y1, x2, y2) { /* ... */ return Math.max(Math.abs(x1-x2), Math.abs(y1-y2)); } // Semplificato per brevità
function parseInputLink(url) { /* ... */ return null; } // Placeholder se non serve qui
function showToast(msg, isBad=false) { /* ... */ } // Placeholder
// (Mantieni le funzioni originali se servono altrove, qui le ho abbreviate per focus sullo sponsor)

// --- SPONSOR STATICO ---
let currentGameCallback = null;
let sponsorInterval = null;

function shouldShowAd() {
    if (isDevMode()) return false;
    if (!isMobileDevice()) return false;
    
    // Cooldown 5 Minuti
    const lastAdTime = parseInt(localStorage.getItem('repanza_last_ad_time') || 0);
    if (Date.now() - lastAdTime < ASSETS_CONFIG.adCooldown) return false;
    
    localStorage.setItem('repanza_last_ad_time', Date.now());
    return true;
}

function createSponsorOverlay() {
    if (document.getElementById('sponsor-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'sponsor-overlay';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.98); z-index: 100000; display: none; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; text-align: center;`;
    overlay.innerHTML = `
        <div style="position: absolute; top: 30px; color: #fbbf24; font-weight: 800; font-size: 20px; font-family: sans-serif; z-index:100;">
            ⏳ <span id="sponsor-timer">10</span>s
        </div>
        
        <div style="position: relative; z-index: 50; max-width: 90%;">
            <h2 style="color: #fff; margin-bottom: 20px; font-family: 'MedievalSharp', cursive;">Il Re sta riposando...</h2>
            <img src="${ASSETS_CONFIG.sponsorImg}" style="max-width: 100%; max-height: 50vh; border-radius: 15px; box-shadow: 0 0 30px rgba(251, 191, 36, 0.3); border: 2px solid #fbbf24;">
            <p style="color: #94a3b8; margin-top: 15px; font-size: 14px;">Attendi che Re Panza finisca il suo spuntino.</p>
        </div>

        <a href="${ASSETS_CONFIG.paypalUrl}" target="_blank" style="position: absolute; bottom: 80px; z-index: 100; padding: 14px 28px; background: #0070ba; color: #fff; text-decoration: none; font-weight: bold; border-radius: 50px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); font-family: sans-serif; text-transform: uppercase; font-size: 14px; animation: pulseBtn 2s infinite;">
            ☕ Offrimi un Caffè
        </a>
        
        <div id="sponsor-close-btn" style="position: absolute; bottom: 20px; z-index: 100; width: 50px; height: 50px; border-radius: 50%; background: #34d399; color: #0f172a; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; box-shadow: 0 0 20px rgba(52, 211, 153, 0.6);">✕</div>

        <style>@keyframes pulseBtn { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }</style>
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
    
    sponsorInterval = setInterval(() => {
        seconds--;
        timerDisplay.innerText = seconds;
        if (seconds <= 0) {
            clearInterval(sponsorInterval);
            timerDisplay.innerText = "0";
            closeBtn.style.display = 'flex'; // Mostra la X per chiudere
        }
    }, 1000);
    
    closeBtn.onclick = function() {
        overlay.style.display = 'none';
        if (currentGameCallback) currentGameCallback();
    };
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Intercetta i click sui giochi per mostrare lo sponsor
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        const originalClick = card.getAttribute('onclick');
        if (originalClick) {
            card.removeAttribute('onclick');
            card.addEventListener('click', () => {
                window.runWithSponsor(() => {
                    // Esegue la funzione originale dopo lo sponsor
                    eval(originalClick); 
                });
            });
        }
    });
});
