const { useState, useEffect } = React;

const ScanningView = () => ( <div className="fc items-center justify-center h-full tc"><Loader2 className="w-16 h-16 text-emerald-400 animate-spin" /><h1 className="t3xl fb text-white mt-8">Scanning...</h1><p className="mt-2 text-gray-400 max-w-md">Scan started. We'll update when ready.</p></div> );

window.ScanningView = ScanningView;

if (typeof module !== 'undefined') {
    module.exports = ScanningView;
}
