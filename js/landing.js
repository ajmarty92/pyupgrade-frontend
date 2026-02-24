function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', function() { menu.classList.toggle('hidden'); });
    }
}

function initModernize() {
    const modernizeButton = document.getElementById('modernize-button');
    const codeInput = document.getElementById('code-input');
    const resultContainer = document.getElementById('result-container');
    const codeOutput = document.getElementById('code-output');
    const buttonText = document.getElementById('button-text');
    const buttonLoader = document.getElementById('button-loader');
    const API_URL = 'http://localhost:8000/api/public/modernize-snippet';

    if (!modernizeButton || !codeInput || !resultContainer || !codeOutput || !buttonText || !buttonLoader) return;

    modernizeButton.addEventListener('click', async () => {
        const snippet = codeInput.value;
        if (!snippet.trim()) { alert('Please paste some code to modernize.'); return; }
        modernizeButton.disabled = true; buttonText.textContent = 'Modernizing...'; buttonLoader.classList.remove('hidden'); resultContainer.classList.add('hidden');
        const outputPre = codeOutput.parentElement;
        outputPre.classList.remove('bg-red-900/30', 'text-red-300'); outputPre.classList.add('bg-emerald-900/30', 'text-emerald-300');
        try {
            const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code_snippet: snippet }) });
            if (!response.ok) { const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred.' })); throw new Error(errorData.detail || 'The server returned an error.'); }
            const data = await response.json();
            codeOutput.textContent = data.modernized_code;
        } catch (error) {
            codeOutput.textContent = `Error: ${error.message}`;
            outputPre.classList.remove('bg-emerald-900/30', 'text-emerald-300'); outputPre.classList.add('bg-red-900/30', 'text-red-300');
        } finally {
            modernizeButton.disabled = false; buttonText.textContent = '✨ Modernize with Gemini'; buttonLoader.classList.add('hidden'); resultContainer.classList.remove('hidden');
        }
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initModernize, initMobileMenu };
} else {
    document.addEventListener('DOMContentLoaded', () => {
         initMobileMenu();
         initModernize();
    });
}
