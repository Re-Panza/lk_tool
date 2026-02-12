/* L&K Tools - Common Functions 
   Include: AI, Toast, Utility, PWA
   PLUS: Blocco PC con QR Code (Bypass: ?dev=true)
   PLUS: Sponsor Statico (Re Panza Image) ogni 5 minuti
*/

// --- 0. RILEVATORE DISPOSITIVO ---
const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;

// --- 🛑 BLOCCO PC CON QR CODE 🛑 ---
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

// --- CONFIGURAZIONE ASSETS ---
const ASSETS_CONFIG = {
    sponsorImg: 'https://re-panza.github.io/lk_tool/repanzapubli.png',
    paypalUrl: 'https://paypal.me/Longo11',
    sponsorDuration: 10000, // 10 secondi
    adCooldown: 300000 // 5 MINUTI
};

// --- SPONSOR STATICO ---
let currentGameCallback = null;
let sponsorInterval = null;

function shouldShowAd() {
    if (isDevMode()) return false;
    if (!isMobileDevice()) return false;
    const lastAdTime = parseInt(localStorage.getItem('repanza_last_ad_time') || 0);
    if (Date.now() - lastAdTime < ASSETS_CONFIG.adCooldown) return false;
    localStorage.setItem('repanza_last_ad_time', Date.now());
    return true;
}

function createSponsorOverlay() {
    if (document.getElementById('sponsor-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'sponsor-overlay';
    overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.98); z-index: 100000; display: none; flex-direction: column; align-items: center; justify-content: center; text-align: center;`;
    overlay.innerHTML = `
        <div style="font-size: 20px; color: #fbbf24; margin-bottom: 20px;">⏳ <span id="sponsor-timer">10</span>s</div>
        <img src="${ASSETS_CONFIG.sponsorImg}" style="max-width: 90%; max-height: 50vh; border-radius: 15px; border: 2px solid #fbbf24; margin-bottom: 20px;">
        <a href="${ASSETS_CONFIG.paypalUrl}" target="_blank" style="padding: 12px 25px; background: #0070ba; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; font-family: sans-serif;">☕ Offrimi un Caffè</a>
        <div id="sponsor-close-btn" style="margin-top: 30px; width: 50px; height: 50px; border-radius: 50%; background: #34d399; color: #000; display: none; align-items: center; justify-content: center; font-size: 24px; cursor: pointer;">✕</div>
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
            closeBtn.style.display = 'flex';
        }
    }, 1000);
    
    closeBtn.onclick = function() {
        overlay.style.display = 'none';
        if (currentGameCallback) currentGameCallback();
    };
};

// INIT LISTENER GIOCHI
document.addEventListener('DOMContentLoaded', () => {
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
