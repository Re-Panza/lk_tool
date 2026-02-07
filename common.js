/* L&K Tools - Common Functions 
   Gestisce: AI, Toast Notifications, Clipboard, Utility
   Url: https://re-panza.github.io/lk_tool/common.js
*/

// --- 1. TOAST MESSAGE (Notifica a comparsa) ---
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

// --- 2. COPY TO CLIPBOARD (Compatibile PC/Mobile) ---
function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(function() {
        showToast("Copiato: " + text);
    }, function(err) {
        console.error('Errore copia', err);
        alert("Impossibile copiare automaticamente. Seleziona e copia manualmente.");
    });
}

// --- 3. GESTIONE AI (Apertura/Chiusura) ---
function toggleAI() {
    const win = document.getElementById('ai-window');
    if (!win) return;
    
    const isHidden = win.style.display === 'none' || win.style.display === '';
    win.style.display = isHidden ? 'block' : 'none';
}

// --- 4. UTILITY ---
function pad(n) { 
    return n < 10 ? '0' + n : n; 
}

// --- 5. EVENT LISTENER GLOBALE (Invio per AI) ---
document.addEventListener('DOMContentLoaded', () => {
    const aiInput = document.getElementById('ai-input');
    if (aiInput) {
        aiInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                if (typeof chiediAlRe === 'function') {
                    chiediAlRe();
                }
            }
        });
    }
});
