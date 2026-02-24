const { initModernize, initMobileMenu } = require('../js/landing.js');

describe('Landing Page Logic', () => {
    let modernizeButton;
    let codeInput;
    let resultContainer;
    let codeOutput;
    let buttonText;
    let buttonLoader;
    let mobileMenuButton;
    let mobileMenu;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <button id="mobile-menu-button"></button>
            <div id="mobile-menu" class="hidden"></div>

            <textarea id="code-input"></textarea>
            <button id="modernize-button">
                <span id="button-text">Modernize</span>
                <svg id="button-loader" class="hidden"></svg>
            </button>
            <div id="result-container" class="hidden">
                <pre class="bg-emerald-900/30 text-emerald-300">
                    <code id="code-output"></code>
                </pre>
            </div>
        `;

        // Get references
        modernizeButton = document.getElementById('modernize-button');
        codeInput = document.getElementById('code-input');
        resultContainer = document.getElementById('result-container');
        codeOutput = document.getElementById('code-output');
        buttonText = document.getElementById('button-text');
        buttonLoader = document.getElementById('button-loader');
        mobileMenuButton = document.getElementById('mobile-menu-button');
        mobileMenu = document.getElementById('mobile-menu');

        // Mock fetch and alert
        global.fetch = jest.fn();
        global.alert = jest.fn();

        // Initialize logic
        initModernize();
        initMobileMenu();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Mobile menu toggles hidden class', () => {
        mobileMenuButton.click();
        expect(mobileMenu.classList.contains('hidden')).toBe(false);
        mobileMenuButton.click();
        expect(mobileMenu.classList.contains('hidden')).toBe(true);
    });

    test('Modernize button alerts if input is empty', () => {
        codeInput.value = '   ';
        modernizeButton.click();
        expect(global.alert).toHaveBeenCalledWith('Please paste some code to modernize.');
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('Modernize button makes API call and updates UI on success', async () => {
        codeInput.value = 'print "hello"';
        const mockResponse = { modernized_code: 'print("hello")' };

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse
        });

        modernizeButton.click();

        // Check loading state immediately
        expect(modernizeButton.disabled).toBe(true);
        expect(buttonText.textContent).toBe('Modernizing...');
        expect(buttonLoader.classList.contains('hidden')).toBe(false);

        // Wait for async operations to complete
        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        // Check final state
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/api/public/modernize-snippet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code_snippet: 'print "hello"' })
        });

        expect(codeOutput.textContent).toBe('print("hello")');
        expect(resultContainer.classList.contains('hidden')).toBe(false);
        expect(codeOutput.parentElement.classList.contains('bg-emerald-900/30')).toBe(true);
        expect(modernizeButton.disabled).toBe(false);
        expect(buttonText.textContent).toBe('✨ Modernize with Gemini');
        expect(buttonLoader.classList.contains('hidden')).toBe(true);
    });

    test('Modernize button handles API error', async () => {
        codeInput.value = 'invalid code';
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'Syntax Error' })
        });

        modernizeButton.click();

        // Wait for async operations to complete
        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        expect(codeOutput.textContent).toBe('Error: Syntax Error');
        expect(codeOutput.parentElement.classList.contains('bg-red-900/30')).toBe(true);
        expect(resultContainer.classList.contains('hidden')).toBe(false);
        expect(modernizeButton.disabled).toBe(false);
    });

    test('Modernize button handles network error', async () => {
        codeInput.value = 'code';
        global.fetch.mockRejectedValueOnce(new Error('Network Error'));

        modernizeButton.click();

        // Wait for async operations to complete
        await new Promise(process.nextTick);
        await new Promise(process.nextTick);

        expect(codeOutput.textContent).toBe('Error: Network Error');
        expect(codeOutput.parentElement.classList.contains('bg-red-900/30')).toBe(true);
        expect(modernizeButton.disabled).toBe(false);
    });
});
