/* L&K Tools - Common Functions 
   Include: AI, Toast, Utility, PWA
   PLUS: Blocco PC con QR Code (Bypass: ?dev=true)
   PLUS: Intro Fullscreen, Sponsor Clean & Copyright Footer
*/

// --- CONFIGURAZIONE ASSETS ---
const ASSETS_CONFIG = {
    sponsorImg: 'https://re-panza.github.io/lk_tool/repanzapubli.png',
    introImg: 'https://re-panza.github.io/lk_tool/re%20panza%20intro.png',
    paypalUrl: 'https://paypal.me/Longo11',
    sponsorDuration: 10000, // 10 secondi di attesa
    introDuration: 4000,    // 4 secondi intro
    adCooldown: 300000      // 5 MINUTI
};

const VIP_CODES = ['REPANZA-KING', 'CAFFE-PAGATO', 'VIP-2025'];

// --- 0. RILEVATORE DISPOSITIVO & BLOCCO PC ---
const isMobileDevice = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
const isDevMode = () => window.location.href.includes('?dev=true');

if (!isMobileDevice() && !isDevMode()) {
    document.addEventListener("DOMContentLoaded", function () {
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
    const ex = document.querySelector('.toast'); if (ex) ex.remove();
    let t = document.createElement("div"); t.className = "toast"; t.innerText = msg;
    Object.assign(t.style, {
        position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(52, 211, 153, 0.95)', color: '#000', padding: '12px 24px',
        borderRadius: '50px', fontWeight: 'bold', zIndex: '10000', pointerEvents: 'none',
        transition: '0.3s', opacity: '0'
    });
    document.body.appendChild(t);
    requestAnimationFrame(() => t.style.opacity = '1');
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

function isUserVip() { return localStorage.getItem('repanza_is_vip') === 'true'; }

// --- LOGICA FOOTER COPYRIGHT ---
function addCopyrightFooter() {
    // 1. Cerca il pulsante PayPal o il suo contenitore
    const paypalContainer = document.querySelector('.paypal-footer, .paypal-link, a[href*="paypal.me"]');

    // 2. Se non esiste un contenitore specifico, usa il fallback originale
    const target = paypalContainer ? paypalContainer.parentElement : (document.querySelector('.container, .wrap, .wrapper') || document.body);

    const footer = document.createElement('footer');
    footer.style.cssText = `
        width: 100%;
        padding: 5px 0 30px 0;
        color: #64748b;
        text-align: center;
        font-family: sans-serif;
        font-size: 11px;
        margin-top: 10px;
    `;

    // Se lo stiamo aggiungendo al body o container generale, manteniamo il bordo e il margine
    if (!paypalContainer) {
        footer.style.marginTop = "50px";
        footer.style.borderTop = "1px solid #1e293b";
        footer.style.paddingTop = "30px";
    }

    const year = new Date().getFullYear();
    footer.innerHTML = `
        <div style="margin-bottom: 3px;">&copy; ${year} <strong>L&K Tools</strong></div>
        <div>Tutti i diritti riservati - Re Panza</div>
    `;

    if (paypalContainer) {
        // Se abbiamo trovato il link o il footer paypal, lo inseriamo subito dopo
        paypalContainer.insertAdjacentElement('afterend', footer);
    } else {
        target.appendChild(footer);
    }
}

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

window.runWithSponsor = function (callback) {
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

    closeBtn.onclick = function () {
        overlay.style.display = 'none';
        if (currentGameCallback) currentGameCallback();
        currentGameCallback = null;
    };
};

// --- INTRO CARICAMENTO (Fullscreen & Animata) ---
function runIntro() {
    if (sessionStorage.getItem('repanza_intro_shown')) return;

    const intro = document.createElement('div');
    intro.id = 'repanza-intro';
    intro.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:200000;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity 0.5s;`;

    const animDuration = ASSETS_CONFIG.introDuration / 1000;

    intro.innerHTML = `
        <div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;">
            <img src="${ASSETS_CONFIG.introImg}" style="width:100%; height:100%; object-fit: cover; opacity:0.8;">
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

    requestAnimationFrame(() => {
        setTimeout(() => {
            if (document.getElementById('intro-bar')) {
                document.getElementById('intro-bar').style.width = '100%';
                document.getElementById('intro-chicken').style.left = '100%';
            }
        }, 100);
    });

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

    // 2. Aggiungi Footer Copyright
    addCopyrightFooter();

    // 3. Intercetta click sui link
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.includes('javascript') || href.includes('paypal') || link.target === '_blank') return;

        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.runWithSponsor(() => { window.location.href = href; });
        });
    });

    // 4. Intercetta click su Game Cards
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

// --- 5. UTILITY COMUNI (Coordinate, Distanze, Habitat) ---
function parseLK(link) {
    if (!link) return null;
    
    // Cerca il pattern delle coordinate ignorando tutto il testo prima o dopo
    let coordMatch = link.match(/coordinates\?(\d+),(\d+)&(\d+)/);
    if (coordMatch) {
        return { x: parseInt(coordMatch[1]), y: parseInt(coordMatch[2]), w: coordMatch[3] };
    }
    
    // Cerca pattern player ignorando testo extra
    let playerMatch = link.match(/player\?([^&]+)&(\d+)/);
    if (playerMatch) {
        return { p: playerMatch[1], w: playerMatch[2] };
    }
    
    // Cerca pattern alliance ignorando testo extra
    let allyMatch = link.match(/alliance\?([^&]+)&(\d+)/);
    if (allyMatch) {
        return { a: allyMatch[1], w: allyMatch[2] };
    }
    
    return null;
}

function getDist(x1, y1, x2, y2) {
    // FORMULA ESATTA DELLA MAPPA ESAGONALE DI LORDS & KNIGHTS
    // Il gioco mappa gli esagoni come "Pointy-topped" con offset sulla asse Y (righe).
    // Converte le coordinate (colonna, riga) in coordinate Assiali Esagonali (q, r).
    
    let q1 = x1 - Math.floor(y1 / 2);
    let r1 = y1;
    
    let q2 = x2 - Math.floor(y2 / 2);
    let r2 = y2;
    
    // Calcola i campi contando esattamente i salti necessari da centro esagono a centro esagono
    let dist = Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs((q1 + r1) - (q2 + r2)));
    
    return dist; // Restituisce un numero intero perfetto, esattamente come il gioco
}

function getHabitatInfo(t) {
    const s = String(t).trim();
    if (s === "0") return { type: 'castello', label: 'Castello', icon: '🏰' };
    if (s === "2") return { type: 'fortezza', label: 'Fortezza', icon: '🛡️' };
    if (s === "4") return { type: 'citta', label: 'Città', icon: '🏙️' };

    const map = {
        'castello': { type: 'castello', label: 'Castello', icon: '🏰' },
        'fortezza': { type: 'fortezza', label: 'Fortezza', icon: '🛡️' },
        'citta': { type: 'citta', label: 'Città', icon: '🏙️' },
        'metropoli': { type: 'metropoli', label: 'Metropoli', icon: '👑' },
        'metro': { type: 'metropoli', label: 'Metropoli', icon: '👑' },
        'libero': { type: 'libero', label: 'Libero', icon: '⚪' }
    };
    return map[s.toLowerCase()] || map['castello'];
}

function pad(n) { return n < 10 ? '0' + n : n; }

// --- 6. LOGICA RE PANZA AI (Centralizzata) ---
const VERCEL_SERVER_URL = "https://re-panza-brain.vercel.app/api";

function toggleAI() {
    const win = document.getElementById('ai-window');
    if (win) {
        win.style.display = win.style.display === 'block' ? 'none' : 'block';
    }
}

async function chiediAlRe() {
    const inputField = document.getElementById('ai-input');
    const question = inputField.value.trim();
    const chatContent = document.getElementById('ai-content');
    if (!question) return;

    chatContent.innerHTML += `<div style="color:#ffcc00; margin-top:10px; font-weight:bold;">👉 Voi:</div><div style="margin-bottom:10px;">${question}</div>`;
    const loadingMsg = document.createElement("div");
    loadingMsg.style.fontStyle = "italic";
    loadingMsg.style.color = "#aaa";
    loadingMsg.innerHTML = "👑 Il Re sta riflettendo...";
    chatContent.appendChild(loadingMsg);
    inputField.value = "";
    chatContent.scrollTop = chatContent.scrollHeight;

    try {
        const response = await fetch(VERCEL_SERVER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: question })
        });
        if (!response.ok) throw new Error("Server error");
        const data = await response.json();
        const testoRisposta = data.risposta;

        loadingMsg.innerHTML = `<div style="color:#ffcc00; font-weight:bold;">👑 Re Panza:</div><span id="typing-area"></span>`;
        const typingArea = loadingMsg.querySelector("#typing-area");
        let i = 0;
        function typeWriter() {
            if (i < testoRisposta.length) {
                typingArea.innerHTML += testoRisposta.charAt(i);
                i++;
                chatContent.scrollTop = chatContent.scrollHeight;
                setTimeout(typeWriter, 20);
            }
        }
        typeWriter();
    } catch (e) {
        console.error("Erroreai:", e);
        loadingMsg.innerHTML = "👑 Il Re è a banchetto, riproverà più tardi!";
    }
}

document.addEventListener('keypress', function (e) {
    const inputField = document.getElementById('ai-input');
    if (e.key === 'Enter' && document.activeElement === inputField) chiediAlRe();
});
