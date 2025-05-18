import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { colors, typography, shadows, borderRadius, animation, buttons, gameStyles } from '../utils/designSystem';

function Signup() {
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const validateStep1 = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!mail.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(mail)) {
      setError("Please enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) {
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            name,
            email: mail,
            username,
            password
          }
        ])
        .select();

      if (error) {
        setError("Error creating account: " + error.message);
      } else {
        // Show success animation before redirecting
        setStep(3); // Success step
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <label className="block text-blue-200 font-medium mb-2">Full Name</label>
        <input
          type="text"
          placeholder="Enter your full name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-blue-200 font-medium mb-2">Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={mail}
          onChange={e => setMail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <button
        type="button"
        onClick={nextStep}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-100"
      >
        Continue
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <label className="block text-blue-200 font-medium mb-2">Username</label>
        <input
          type="text"
          placeholder="Choose a unique username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-blue-200 font-medium mb-2">Password</label>
        <input
          type="password"
          placeholder="Create a secure password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div>
        <label className="block text-blue-200 font-medium mb-2">Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={prevStep}
          className="w-1/3 py-4 bg-gray-700 text-white rounded-xl font-medium text-lg hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-2/3 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
            isLoading ? 'bg-indigo-700 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-100'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="py-10 text-center">
      <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-8 animate-pulse">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Account Created Successfully!</h3>
      <p className="text-blue-200 text-lg">Redirecting you to login...</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-purple-900 bg-fixed p-4" 
         style={{ backgroundImage: gameStyles.backgrounds.secondary, backgroundSize: 'cover' }}>
      
      {/* Floating particles for visual appeal */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="particle absolute h-2 w-2 rounded-full bg-purple-400 opacity-50 top-1/3 left-1/4 animate-pulse"></div>
        <div className="particle absolute h-3 w-3 rounded-full bg-indigo-400 opacity-40 top-2/3 left-1/3 animate-ping"></div>
        <div className="particle absolute h-2 w-2 rounded-full bg-blue-400 opacity-30 top-1/2 right-1/3 animate-pulse"></div>
      </div>
      
      {/* Logo/Branding */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: typography.fontFamily.display }}>
          GameVerse
        </h1>
        <p className="text-purple-200 text-lg">Join the ultimate gaming experience</p>
      </div>
      
      {/* Signup Card - Desktop Optimized */}
      <div className="w-full max-w-xl rounded-3xl shadow-2xl backdrop-blur-lg p-10 border border-white/10"
           style={{ background: 'rgba(15, 23, 42, 0.6)', minHeight: '560px' }}>
        
        {step < 3 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Create Your Account</h2>
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-gray-600'}`}></div>
              <div className="w-12 h-0.5 bg-gray-700"></div>
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-gray-600'}`}></div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-500/50 text-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderSuccess()}
        </form>

        {step < 3 && (
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-lg">Already have an account?</p>
            <button
              onClick={() => navigate('/')}
              className="mt-2 text-indigo-400 hover:text-indigo-300 transition-colors font-medium text-lg"
            >
              Sign in instead
            </button>
          </div>
        )}
      </div>
      
      {/* Terms and conditions or additional info */}
      {step < 3 && (
        <div className="mt-8 text-center text-sm text-gray-400 max-w-lg mx-auto">
          By creating an account, you agree to our <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a> and acknowledge our <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>.
        </div>
      )}
    </div>
  );
}

export default Signup;