import React, { useState, useMemo } from "react";
import { Cpu, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, KeyRound, Sparkles, Check, X } from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { auth } from "../firebase";

interface AuthPageProps {
  onLoginSuccess: () => void;
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair", color: "#f97316" };
  if (score <= 3) return { score, label: "Good", color: "#eab308" };
  if (score <= 4) return { score, label: "Strong", color: "#22c55e" };
  return { score, label: "Excellent", color: "#06b6d4" };
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const passwordChecks = useMemo(() => [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setErrorMessage("");
    setSuccessMessage("");
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    
    if (mode === 'login') {
      if (!email || !password) {
        setErrorMessage("Please fill in all fields.");
        return;
      }
      setLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess();
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setErrorMessage("Invalid email or password combination.");
        } else {
          setErrorMessage(err.message || "An error occurred during authentication.");
        }
      } finally {
        setLoading(false);
      }
    } else if (mode === 'register') {
      if (!email || !password || !name) {
        setErrorMessage("Please fill in all fields.");
        return;
      }
      if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setSuccessMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          setSuccessMessage("");
          setMode('login');
        }, 1500);
      } catch (err: any) {
        console.error(err);
        if (err.code === 'auth/email-already-in-use') {
          setErrorMessage("This email address is already registered.");
        } else if (err.code === 'auth/weak-password') {
          setErrorMessage("Password is too weak. Must be at least 6 characters.");
        } else {
          setErrorMessage(err.message || "An error occurred during registration.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!email) {
        setErrorMessage("Please enter your email address.");
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccessMessage("Reset instructions have been sent to your email.");
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Failed to send reset instructions.");
      } finally {
        setLoading(false);
      }
    }
  };

  const modeIcon = mode === 'login' ? ShieldCheck : mode === 'register' ? Sparkles : KeyRound;
  const ModeIcon = modeIcon;

  return (
    <div className="flex-1 min-h-screen bg-[#07070a] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">

      <style>{`
        @keyframes auth-orbit-1 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.12; }
          25%  { transform: translate(60px, -80px) scale(1.15); opacity: 0.18; }
          50%  { transform: translate(-30px, -120px) scale(1.05); opacity: 0.10; }
          75%  { transform: translate(-80px, -40px) scale(1.2); opacity: 0.16; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.12; }
        }
        @keyframes auth-orbit-2 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.08; }
          30%  { transform: translate(-50px, 60px) scale(1.1); opacity: 0.14; }
          60%  { transform: translate(40px, 100px) scale(0.95); opacity: 0.06; }
          100% { transform: translate(0, 0) scale(1); opacity: 0.08; }
        }
        @keyframes auth-orbit-3 {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(70px, 30px) scale(1.08); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes auth-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes auth-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes auth-glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.15), 0 0 60px rgba(99,102,241,0.05); }
          50%      { box-shadow: 0 0 30px rgba(99,102,241,0.25), 0 0 80px rgba(99,102,241,0.1); }
        }
        @keyframes auth-border-glow {
          0%, 100% { border-color: rgba(99,102,241,0.12); }
          50%      { border-color: rgba(99,102,241,0.25); }
        }
        @keyframes auth-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes auth-check-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes auth-strength-fill {
          from { width: 0%; }
        }
        .auth-orbit-1 { animation: auth-orbit-1 18s ease-in-out infinite; }
        .auth-orbit-2 { animation: auth-orbit-2 22s ease-in-out infinite; }
        .auth-orbit-3 { animation: auth-orbit-3 14s ease-in-out infinite; }
        .auth-icon-float { animation: auth-float 3s ease-in-out infinite; }
        .auth-shimmer-bar {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          background-size: 200% 100%;
          animation: auth-shimmer 3s infinite;
        }
        .auth-card-glow { animation: auth-glow-pulse 4s ease-in-out infinite; }
        .auth-border-breathe { animation: auth-border-glow 4s ease-in-out infinite; }
        .auth-field-appear {
          animation: auth-fade-in 0.35s ease-out both;
        }
        .auth-check-pop { animation: auth-check-pop 0.3s ease-out both; }
        .auth-strength-animate { animation: auth-strength-fill 0.5s ease-out both; }
        .auth-input-field {
          background: rgba(10, 10, 18, 0.7) !important;
          border: 1px solid rgba(255,255,255,0.06) !important;
          border-radius: 14px !important;
          padding: 12px 14px 12px 42px !important;
          font-size: 13px !important;
          color: #e2e8f0 !important;
          transition: border-color 0.25s ease, box-shadow 0.25s ease !important;
          width: 100% !important;
        }
        .auth-input-field:focus {
          border-color: rgba(99,102,241,0.5) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.08), inset 0 0 12px rgba(99,102,241,0.03) !important;
          outline: none !important;
        }
        .auth-input-field::placeholder {
          color: #4a5064 !important;
        }
        .auth-input-with-toggle {
          padding-right: 42px !important;
        }
        .auth-submit-btn {
          width: 100%;
          padding: 13px 0;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.02em;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #4f46e5, #6366f1, #818cf8);
          color: white;
          box-shadow: 0 4px 15px -3px rgba(79, 70, 229, 0.4), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .auth-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px -4px rgba(79, 70, 229, 0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .auth-submit-btn:active:not(:disabled) {
          transform: translateY(0px);
        }
        .auth-submit-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .auth-submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: auth-shimmer 2.5s infinite;
        }
        .auth-link-btn {
          color: #818cf8;
          font-weight: 600;
          font-size: 12px;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.2s ease;
          padding: 0;
        }
        .auth-link-btn:hover {
          color: #a5b4fc;
        }
      `}</style>

      {/* Animated orbital background blobs */}
      <div className="auth-orbit-1" style={{ position:'absolute', top:'10%', left:'15%', width:420, height:420, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }} />
      <div className="auth-orbit-2" style={{ position:'absolute', bottom:'5%', right:'10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter:'blur(80px)', pointerEvents:'none' }} />
      <div className="auth-orbit-3" style={{ position:'absolute', top:'50%', left:'60%', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter:'blur(50px)', pointerEvents:'none' }} />

      {/* Subtle dot grid */}
      <div style={{ position:'absolute', inset:0, opacity:0.025, pointerEvents:'none', backgroundImage:'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize:'32px 32px' }} />

      {/* Main card */}
      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:10 }}>

        {/* Brand header */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32, textAlign:'center' }}>
          <div className="auth-icon-float auth-card-glow" style={{
            width: 60, height: 60,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="auth-shimmer-bar" style={{ position:'absolute', inset:0 }} />
            <Cpu style={{ width:26, height:26, color:'#818cf8', position:'relative', zIndex:1 }} />
          </div>
          <h1 style={{ fontSize:24, fontWeight:900, letterSpacing:'-0.02em', color:'#fff', margin:0 }}>
            CodeScope{' '}
            <span style={{ background:'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Intelligence
            </span>
          </h1>
          <p style={{ fontSize:12, color:'#64748b', marginTop:6, letterSpacing:'0.01em' }}>
            {mode === 'login' ? 'Sign in to access static analysis pipeline' :
             mode === 'register' ? 'Create your developer account' :
             'Recover access to your account'}
          </p>
        </div>

        {/* Glass card */}
        <div className="auth-border-breathe" style={{
          background: 'rgba(12, 14, 22, 0.65)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(99,102,241,0.12)',
          borderRadius: 24,
          padding: '36px 32px 32px',
          boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
          {/* Mode indicator row */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
            <div style={{
              width:34, height:34, borderRadius:10,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
              border: '1px solid rgba(99,102,241,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <ModeIcon style={{ width:16, height:16, color:'#a5b4fc' }} />
            </div>
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#fff', margin:0, lineHeight:1.2 }}>
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p style={{ fontSize:11, color:'#64748b', margin:0, marginTop:2 }}>
                {mode === 'login' ? 'Enter your credentials to continue' :
                 mode === 'register' ? 'Fill in details to get started' :
                 'We\'ll send you recovery instructions'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Name field (Register only) */}
            {mode === 'register' && (
              <div className="auth-field-appear" style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontSize:10, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Full Name</label>
                <div style={{ position:'relative' }}>
                  <User style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#475569' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="auth-input-field"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="auth-field-appear" style={{ display:'flex', flexDirection:'column', gap:6, animationDelay: mode === 'register' ? '0.05s' : '0s' }}>
              <label style={{ fontSize:10, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#475569' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="auth-input-field"
                />
              </div>
            </div>

            {/* Password field */}
            {mode !== 'forgot' && (
              <div className="auth-field-appear" style={{ display:'flex', flexDirection:'column', gap:6, animationDelay: mode === 'register' ? '0.1s' : '0.05s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <label style={{ fontSize:10, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="auth-link-btn"
                      style={{ fontSize:10 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position:'relative' }}>
                  <Lock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#475569' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="auth-input-field auth-input-with-toggle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', alignItems:'center', justifyContent:'center' }}
                  >
                    {showPassword
                      ? <EyeOff style={{ width:15, height:15, color:'#64748b', transition:'color 0.2s' }} />
                      : <Eye style={{ width:15, height:15, color:'#64748b', transition:'color 0.2s' }} />
                    }
                  </button>
                </div>

                {/* Password strength meter (register mode) */}
                {mode === 'register' && password.length > 0 && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ flex:1, height:4, borderRadius:4, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                        <div className="auth-strength-animate" style={{
                          height:'100%',
                          borderRadius:4,
                          width: `${(strength.score / 5) * 100}%`,
                          background: strength.color,
                          transition: 'width 0.4s ease, background 0.3s ease',
                        }} />
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, color: strength.color, minWidth:55, textAlign:'right' }}>
                        {strength.label}
                      </span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 12px' }}>
                      {passwordChecks.map((check, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <div className={check.met ? 'auth-check-pop' : ''} style={{
                            width:14, height:14, borderRadius:4,
                            background: check.met ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${check.met ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            transition: 'all 0.25s ease',
                          }}>
                            {check.met
                              ? <Check style={{ width:9, height:9, color:'#22c55e' }} />
                              : <X style={{ width:8, height:8, color:'#475569' }} />
                            }
                          </div>
                          <span style={{ fontSize:10, color: check.met ? '#94a3b8' : '#475569', transition:'color 0.25s ease' }}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Confirm Password field (Register only) */}
            {mode === 'register' && (
              <div className="auth-field-appear" style={{ display:'flex', flexDirection:'column', gap:6, animationDelay:'0.15s' }}>
                <label style={{ fontSize:10, color:'#64748b', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Confirm Password</label>
                <div style={{ position:'relative' }}>
                  <Lock style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#475569' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="auth-input-field auth-input-with-toggle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, display:'flex', alignItems:'center', justifyContent:'center' }}
                  >
                    {showConfirmPassword
                      ? <EyeOff style={{ width:15, height:15, color:'#64748b' }} />
                      : <Eye style={{ width:15, height:15, color:'#64748b' }} />
                    }
                  </button>
                </div>
                {/* Match indicator */}
                {confirmPassword.length > 0 && (
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                    {password === confirmPassword ? (
                      <>
                        <Check style={{ width:12, height:12, color:'#22c55e' }} />
                        <span style={{ fontSize:10, color:'#22c55e' }}>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X style={{ width:12, height:12, color:'#ef4444' }} />
                        <span style={{ fontSize:10, color:'#ef4444' }}>Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Feedback messages */}
            {errorMessage && (
              <div className="auth-field-appear" style={{
                fontSize:12, color:'#fca5a5',
                background:'rgba(239,68,68,0.08)',
                border:'1px solid rgba(239,68,68,0.15)',
                padding:'10px 14px',
                borderRadius:12,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <div style={{ width:18, height:18, borderRadius:6, background:'rgba(239,68,68,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <X style={{ width:10, height:10, color:'#ef4444' }} />
                </div>
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="auth-field-appear" style={{
                fontSize:12, color:'#86efac',
                background:'rgba(34,197,94,0.08)',
                border:'1px solid rgba(34,197,94,0.15)',
                padding:'10px 14px',
                borderRadius:12,
                display:'flex', alignItems:'center', gap:8,
              }}>
                <div style={{ width:18, height:18, borderRadius:6, background:'rgba(34,197,94,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <Check style={{ width:10, height:10, color:'#22c55e' }} />
                </div>
                {successMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
              style={{ marginTop:4 }}
            >
              <span style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:8 }}>
                {loading ? (
                  <div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.25)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}
                    <ArrowRight style={{ width:15, height:15 }} />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Toggle modes footer */}
          <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.04)', textAlign:'center', fontSize:12, color:'#64748b' }}>
            {mode === 'login' ? (
              <p style={{ margin:0 }}>
                Don't have an account?{' '}
                <button onClick={() => switchMode('register')} className="auth-link-btn">
                  Create one
                </button>
              </p>
            ) : mode === 'register' ? (
              <p style={{ margin:0 }}>
                Already have an account?{' '}
                <button onClick={() => switchMode('login')} className="auth-link-btn">
                  Sign in
                </button>
              </p>
            ) : (
              <p style={{ margin:0 }}>
                Remember your password?{' '}
                <button onClick={() => switchMode('login')} className="auth-link-btn">
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Bottom security badge */}
        <div style={{ display:'flex', justifyContent:'center', marginTop:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)' }}>
            <ShieldCheck style={{ width:12, height:12, color:'#475569' }} />
            <span style={{ fontSize:10, color:'#475569', letterSpacing:'0.02em' }}>Secured with Firebase Authentication</span>
          </div>
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
