// Configuration for PyUpgrade
const CONFIG = {
    // Production (Vercel)
    'pyupgrade-app.vercel.app': 'https://pyupgrade-f203f8648dc3.herokuapp.com',
    // Local development
    'localhost': 'http://localhost:8000',
    '127.0.0.1': 'http://localhost:8000'
};

const DEFAULT_BACKEND_URL = 'http://localhost:8000';

window.getBackendUrl = function() {
    const hostname = window.location.hostname;
    if (CONFIG[hostname]) {
        return CONFIG[hostname];
    }
    return DEFAULT_BACKEND_URL;
};
