/* L&K Tools - Common Functions 
   Gestisce: AI, Toast Notifications, Clipboard, Utility, Math
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

// --- 3. TOAST MESSAGE ---
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
        whiteSpace: 'nowrap'
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
    }, 2000);
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
