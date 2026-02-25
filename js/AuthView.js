const AuthView = ({ onLoginSuccess, initialAction }) => {
    const { useState } = React;
    const [isSignUp, setIsSignUp] = useState(initialAction === 'signup');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const ep = isSignUp ? '/auth/signup' : '/auth/login';
        try {
            const r = await fetch(`${BACKEND_URL}${ep}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, provider: 'email' })
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.detail);
            if (isSignUp) {
                setIsSignUp(false);
            } else {
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white"><span className="text-emerald-400">Py</span>Upgrade</h1>
                <p className="mt-2 text-lg text-gray-400">Scan codebase for Python version risks.</p>
            </div>
            <div className="mt-8 bg-gray-900/50 border border-gray-700 p-8 rounded-xl max-w-sm w-full">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full py-28">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-400" />
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-semibold text-white text-center mb-6">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
                        <div className="space-y-3">
                            <a href={`${BACKEND_URL}/auth/github/login`} className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                                <Github className="w-5 h-5 mr-3" /> Continue with GitHub
                            </a>
                            <a href={`${BACKEND_URL}/auth/google/login`} className="w-full flex items-center justify-center bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors">
                                <GoogleGLogo /> Continue with Google
                            </a>
                        </div>
                        <div className="my-6 flex items-center">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-gray-800/50 border border-gray-600 text-white rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                </div>
                            </div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
                        </form>
                        <p className="mt-6 text-center text-sm text-gray-400">
                            {isSignUp ? 'Have account?' : "Don't have account?"}
                            <button onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="ml-1 font-semibold text-emerald-400 hover:text-emerald-300">
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

if (typeof window !== 'undefined') {
    window.AuthView = AuthView;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthView;
}
