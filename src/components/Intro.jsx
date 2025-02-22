import React, { useState, useEffect, useRef } from "react";
import { X, SkipForward } from "lucide-react";
import SplitText from "./Split";
import Squares from "./Squares";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { server_url } = require("../config/config.json");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${server_url}/pass/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("Password reset instructions sent to your email!", { theme: "dark", transition: Bounce });
        onClose();
      } else {
        toast.error(data.error || "Failed to send reset instructions.", { theme: "dark", transition: Bounce });
      }
    } catch (error) {
      setLoading(false);
      toast.error("Network error. Please try again.", { theme: "dark", transition: Bounce });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 p-8 rounded-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-white">Reset Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          We'll send you instructions to reset your password.
        </p>
      </div>
    </div>
  );
};

const AuthPage = ({ isOpen, onClose, initialMode = "login" }) => {
  const { server_url } = require("../config/config.json");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const isValidUsername = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const isValidPassword = (password) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      password
    );

  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!", { theme: "dark", transition: Bounce });
        setLoading(false);
        return;
      } else if (!isValidPassword(formData.password)) {
        toast.error("Password must be at least 8 characters long, with at least one letter, one number, and one special character.", { theme: "dark", transition: Bounce });
        setLoading(false);
        return;
      } else if (!isValidUsername(formData.username)) {
        toast.error("Username must be 3-20 characters long and contain only letters, numbers, or underscores.", { theme: "dark", transition: Bounce });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${server_url}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          toast.success("Signup successful! Please log in.", { theme: "dark", transition: Bounce });
          setMode("login");
        } else {
          toast.error(data.error || "Signup failed.", { theme: "dark", transition: Bounce });
        }
      } catch (error) {
        setLoading(false);
        toast.error("Network error. Please try again.", { theme: "dark", transition: Bounce });
      }
    } else {
      try {
        const response = await fetch(`${server_url}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        setLoading(false);

        if (response.ok) {
          toast.success("Login successful! Redirecting to dashboard.", { theme: "dark", transition: Bounce });
          localStorage.setItem("token", data.token);
          setTimeout(() => navigate('/dashboard'), 4000);
        } else {
          toast.error(data.error || "Login failed.", { theme: "dark", transition: Bounce });
        }
      } catch (error) {
        setLoading(false);
        toast.error("Network error. Please try again.", { theme: "dark", transition: Bounce });
      }
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-black border border-gray-800 p-8 rounded-lg w-full max-w-md relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-6 text-white">
                {mode === "login" ? "Sign In" : "Sign Up"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                  />
                </div>

                {mode === "signup" && (
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full p-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
                    />
                    <p className="flex justify-center text-gray-600 text-xs mt-2">
                      By signing up, you agree to receive emails.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full p-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  {loading ? "Processing..." : mode === "login" ? "Sign In" : "Sign Up"}
                </button>
              </form>

              <div className="mt-4 text-center space-y-2">
                <p className="text-gray-500">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => setMode(mode === "login" ? "signup" : "login")} 
                    className="text-white hover:underline"
                  >
                    {mode === "login" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
                
                {mode === "login" && (
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-gray-500 hover:text-white transition-colors"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />

      <ToastContainer 
        position="top-center" 
        autoClose={5000} 
        hideProgressBar={false} 
        closeOnClick 
        pauseOnHover 
        draggable 
        theme="dark" 
        transition={Bounce} 
      />
    </>
  );
};

const StudyBuddyIntro = () => {
  const navigate = useNavigate();
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      
      if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        return false;
      }

      return true;
    } catch (error) {
      console.log("Invalid token");
      localStorage.removeItem("token");
      return false;
    }
  };

  if (isAuthenticated()) {
    navigate('/dashboard');
  }

  const [showFirstLine, setShowFirstLine] = useState(true);
  const [showSecondLine, setShowSecondLine] = useState(false);
  const [showThirdLine, setShowThirdLine] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [visibleInfos, setVisibleInfos] = useState([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const timeoutRefs = useRef({});

  const infoSnippets = [
    "Plan. Track. Achieve.",
    "Smart study, simplified.",
    "Your goals, organized.",
    "AI-powered productivity.",
    "Focus without distractions.",
    "Efficient study planning.",
    "Seamless note-taking.",
    "Optimize your schedule.",
    "Stay on track, effortlessly.",
    "Your workspace, your way."
  ];

  const skipIntro = () => {
    Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
    setShowFirstLine(false);
    setShowSecondLine(false);
    setShowThirdLine(false);
    setShowButtons(true);
  };

  useEffect(() => {
    timeoutRefs.current.secondLine = setTimeout(() => {
      setShowFirstLine(false);
      setShowSecondLine(true);
    }, 3000);
    
    timeoutRefs.current.thirdLine = setTimeout(() => {
      setShowSecondLine(false);
      setShowThirdLine(true);
    }, 6000);
    
    timeoutRefs.current.buttons = setTimeout(() => {
      setShowThirdLine(false);
      setShowButtons(true);
    }, 9000);

    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  useEffect(() => {
    let interval;
    if (showButtons) {
      interval = setInterval(() => {
        setVisibleInfos(current => {
          const newInfos = current.filter(info => Date.now() - info.timestamp < 3000);
          
          if (newInfos.length < 3) {
            const availableSnippets = infoSnippets.filter(
              snippet => !newInfos.some(info => info.text === snippet)
            );
            if (availableSnippets.length > 0) {
              const randomSnippet = availableSnippets[Math.floor(Math.random() * availableSnippets.length)];
              const isTop = Math.random() > 0.5;
              const position = {
                left: `${Math.random() * 60 + 20}%`,
                top: `${isTop ? Math.random() * 30 + 5 : Math.random() * 30 + 65}%`
              };
              newInfos.push({
                text: randomSnippet,
                position,
                timestamp: Date.now(),
                id: Date.now()
              });
            }
          }
          return newInfos;
        });
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showButtons]);

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center" style={{fontFamily: "Poppins"}}>
      <div className="absolute inset-0">
        <Squares 
          style={{ opacity: 0.3, color: "#222" }} 
          borderColor="#262626"
          speed={0.2}
        />
      </div>
      
      {!showButtons && (
        <button
          onClick={skipIntro}
          className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors duration-300 rounded-lg border border-gray-800 hover:border-gray-600 bg-black bg-opacity-50"
        >
          <span>Skip</span>
          <SkipForward size={16} />
        </button>
      )}
      
      <div className="text-center space-y-4 relative z-10">
        {showFirstLine && (
          <SplitText
            className="text-4xl font-semibold fade-in-out"
            delay={50}
            wordDuration={400}
            text="Hello, I'm Study Buddy."
          />
        )}

        {showSecondLine && (
          <SplitText
            className="text-4xl font-semibold fade-in-out"
            delay={20}
            wordDuration={400}
            text="Your intelligent study companion."
          />
        )}

        {showThirdLine && (
          <SplitText
            className="text-4xl font-semibold fade-in-out"
            delay={30}
            wordDuration={400}
            text="Plan, track, and excel with ease."
          />
        )}

        {showButtons && (
          <div className="flex flex-col gap-6 mt-12 animate-fadeIn">
            <button 
              className="px-8 py-3 text-lg border border-white rounded-lg hover:bg-white hover:text-black transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => {
                setAuthMode("login");
                setIsAuthOpen(true);
              }}
            >
              Sign In
            </button>
            <div className="relative">
              <div className="absolute inset-0 bg-white blur opacity-20 rounded-lg" />
              <button 
                className="relative px-8 py-3 text-lg bg-white text-black rounded-lg hover:bg-opacity-90 transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={() => {
                  setAuthMode("signup");
                  setIsAuthOpen(true);
                }}
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </div>

      {showButtons && visibleInfos.map((info) => (
        <div
          key={info.id}
          className="absolute text-gray-400 text-lg fade-in-out"
          style={info.position}
        >
          {info.text}
        </div>
      ))}

      <AuthPage 
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        initialMode={authMode}
      />

      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .fade-in-out {
          animation: fadeInOut 3s forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 1s forwards;
        }
      `}</style>
    </div>
  );
};

export default StudyBuddyIntro;