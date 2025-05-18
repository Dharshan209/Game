import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { colors, typography, shadows, borderRadius, animation, buttons, gameStyles } from '../utils/designSystem';

function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      let { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', name)
        .eq('password', password)
        .single();

      if (error || !profiles) {
        setError("Invalid username or password");
      } else {
        localStorage.setItem("user", JSON.stringify(profiles));
        localStorage.setItem("username", profiles.username);
        navigate('/Home');
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 bg-fixed p-4" 
         style={{ backgroundImage: gameStyles.backgrounds.primary, backgroundSize: 'cover' }}>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle absolute h-2 w-2 rounded-full bg-blue-400 opacity-50 top-1/4 left-1/3 animate-pulse"></div>
        <div className="particle absolute h-3 w-3 rounded-full bg-indigo-400 opacity-40 top-2/3 left-1/4 animate-ping"></div>
        <div className="particle absolute h-2 w-2 rounded-full bg-purple-400 opacity-30 top-1/2 right-1/4 animate-pulse"></div>
      </div>
      
      {/* Logo/Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: typography.fontFamily.display }}>
          GameVerse
        </h1>
        <p className="text-blue-200 text-lg">Enter the realm of strategy and deception</p>
      </div>
      
      {/* Login Card */}
      <div className="w-full max-w-md rounded-3xl shadow-2xl backdrop-blur-lg p-8 border border-white/10"
           style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
        
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Welcome Back</h2>
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-500/50 text-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-blue-200 font-medium mb-2">Username</label>
            <input
              placeholder="Enter your username"
              type="text"
              value={name}
              required
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-blue-200 font-medium">Password</label>
              <a href="#" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              required
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 relative overflow-hidden ${
              isLoading ? 'bg-blue-700 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-100'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400">Don't have an account?</p>
          <button
            onClick={handleSignup}
            className="mt-2 text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Create an account
          </button>
        </div>
        
        {/* Optional: Social login buttons or other entry points */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center mb-4">Or continue with</p>
          <div className="flex justify-center space-x-4">
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.532 1.03 1.532 1.03.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </button>
            <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.424 25.424 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.814 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.686 8.686 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.32 35.32 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;