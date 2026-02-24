const { useState, useEffect } = React;

const MainAppView = ({ onLogout }) => {
    const [appState, setAppState] = useState('repo_selection');
    const [scanResult, setScanResult] = useState(null);
    const [repos, setRepos] = useState([]);
    const [isLoadingRepos, setIsLoadingRepos] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => { const fr = async () => { setIsLoadingRepos(true); setError(null); try { const r = await fetch(`${BACKEND_URL}/api/repositories`, { credentials: 'include' }); if (!r.ok) { const ed = await r.json(); if (r.status === 403) { throw new Error("Link GitHub account."); } throw new Error(ed.detail || "Failed fetch repos."); } setRepos(await r.json()); } catch (err) { setError(err.message); } finally { setIsLoadingRepos(false); } }; fr(); }, []);

    const handleScan = async (repoFullName) => { setAppState('scanning'); setError(null); try { const sr = await fetch(`${BACKEND_URL}/api/scan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repo_name: repoFullName }), credentials: 'include' }); if (!sr.ok) { const ed = await sr.json(); throw new Error(ed.detail || "Failed scan start."); } const { task_id } = await sr.json(); const pi = setInterval(async () => { try { const ssr = await fetch(`${BACKEND_URL}/api/scan/status/${task_id}`, { credentials: 'include' }); if (!ssr.ok) { clearInterval(pi); throw new Error("Failed scan status."); } const sd = await ssr.json(); if (sd.status === 'SUCCESS') { clearInterval(pi); setScanResult(sd.result); setAppState('report'); } else if (sd.status === 'FAILURE') { clearInterval(pi); throw new Error(sd.detail || "Scan failed."); } } catch (err) { clearInterval(pi); setError(err.message); setAppState('repo_selection'); } }, 3000); } catch (err) { setError(err.message); setAppState('repo_selection'); } };

    const handleNewScan = () => { setScanResult(null); setAppState('repo_selection'); };

    const handleGenerateFix = async (issueIndex) => { const i = scanResult.syntaxIssues[issueIndex]; const ui = [...scanResult.syntaxIssues]; ui[issueIndex] = { ...i, isLoadingSuggestion: true }; setScanResult({ ...scanResult, syntaxIssues: ui }); try { const r = await fetch(`${BACKEND_URL}/api/generate-fix`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code_snippet: i.code_snippet, issue_type: i.type, file_path: i.file, line: i.line }), credentials: 'include' }); if (!r.ok) { const ed = await r.json(); throw new Error(ed.detail || "AI fail."); } const d = await r.json(); const fi = [...scanResult.syntaxIssues]; fi[issueIndex] = { ...i, suggestion: d.suggestion, isLoadingSuggestion: false }; setScanResult({ ...scanResult, syntaxIssues: fi }); } catch (err) { const fi = [...scanResult.syntaxIssues]; fi[issueIndex] = { ...i, suggestion: `Error: ${err.message}`, isLoadingSuggestion: false }; setScanResult({ ...scanResult, syntaxIssues: fi }); } };

    const renderMainContent = () => { if (error) { return <div className="fc items-center justify-center h-full tc"><ServerCrash className="w-12 h-12 text-red-400" /><h1 className="t2xl fb text-white mt-6">Error</h1><p className="mt-1 text-gray-400 max-w-md">{error}</p></div>; } switch (appState) { case 'repo_selection': return <RepoSelectionView repos={repos} isLoading={isLoadingRepos} onScan={handleScan} />; case 'scanning': return <ScanningView />; case 'report': return <ReportView result={scanResult} onNewScan={handleNewScan} onGenerateFix={handleGenerateFix} />; default: return <RepoSelectionView repos={repos} isLoading={isLoadingRepos} onScan={handleScan} />; } };

    return <div className="py-8 h-full flex flex-col"><header className="flex justify-between items-center flex-shrink-0"><h1 className="t2xl fb text-white"><span className="text-emerald-400">Py</span>Upgrade</h1><button onClick={onLogout} className="flex items-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"><LogOut className="w-4 h-4 mr-2" />Logout</button></header><main className="flex-grow mt-4 overflow-y-auto">{renderMainContent()}</main></div>;
};

window.MainAppView = MainAppView;

if (typeof module !== 'undefined') {
    module.exports = MainAppView;
}
