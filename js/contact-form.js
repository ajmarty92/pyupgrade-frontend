// Submits the contact form to Netlify Forms via fetch instead of a full-page
// POST, so a successful submit can swap in an inline confirmation.
(function () {
    function encode(data) {
        return Object.keys(data)
            .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');
    }

    const form = document.getElementById('contact-form');
    if (!form) return;

    const submitButton = document.getElementById('contact-submit');
    const errorEl = document.getElementById('contact-error');
    const successEl = document.getElementById('contact-success');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorEl.classList.add('hidden');
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        const data = Object.fromEntries(new FormData(form).entries());

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: encode(data),
        })
            .then((response) => {
                if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
                form.classList.add('hidden');
                successEl.classList.remove('hidden');
            })
            .catch(() => {
                errorEl.textContent = "Something went wrong sending your message. Please try again.";
                errorEl.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = "Let's talk";
            });
    });
})();
