const { useState, useEffect } = React;

const RepoSelectionView = ({ repos, isLoading, onScan }) => {
    const [selectedRepo, setSelectedRepo] = useState(null);
    useEffect(() => { if (repos && repos.length > 0 && !selectedRepo) { setSelectedRepo(repos[0].full_name); } }, [repos, selectedRepo]);
    if (isLoading) { return <div className="fc items-center justify-center h-full tc"><Loader2 className="w-12 h-12 text-emerald-400 animate-spin" /><h1 className="t2xl fb text-white mt-6">Fetching...</h1></div>; }
    if (repos.length === 0) { return <div className="fc items-center justify-center h-full tc"><FileCode className="w-12 h-12 text-gray-500" /><h1 className="t2xl fb text-white mt-6">No Python Repos Found</h1><p className="mt-1 text-gray-400 max-w-md">No Python repos in GitHub.</p></div>; }
    return <div className="max-w-4xl mx-auto"> <h1 className="t3xl fb text-white">Select Repo</h1><p className="mt-2 text-gray-400">Choose repo to scan.</p><div className="mt-8 space-y-4 max-h-[60vh] overflow-y-auto pr-2">{repos.map(repo => ( <div key={repo.id} onClick={() => setSelectedRepo(repo.full_name)} className={`bg-gray-800/50 border ${selectedRepo === repo.full_name ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-gray-700'} p-4 rounded-lg cursor-pointer transition-all hover:border-emerald-600`}><div className="flex items-center"><input type="radio" name="repo-selection" checked={selectedRepo === repo.full_name} readOnly className="w-4 h-4 text-emerald-600 bg-gray-700 border-gray-600"/><div className="ml-4 flex-grow"><p className="font-semibold text-white flex items-center">{repo.owner.login} / <span className="font-bold">{repo.name}</span>{repo.private && <Lock className="w-3 h-3 ml-2 text-gray-400" />}</p><p className="text-sm text-gray-400">{repo.description}</p></div></div></div>))}</div><div className="mt-8 text-right"><button onClick={() => onScan(selectedRepo)} disabled={!selectedRepo} className="bg-emerald-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-gray-600 flex items-center ml-auto">Scan Repo <ChevronRight className="w-5 h-5 ml-2" /></button></div></div>;
};

window.RepoSelectionView = RepoSelectionView;

if (typeof module !== 'undefined') {
    module.exports = RepoSelectionView;
}
