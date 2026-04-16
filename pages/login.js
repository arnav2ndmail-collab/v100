import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { getSupabase, isSupabaseReady } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!isSupabaseReady()) return
    const sb = getSupabase()
    sb.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/'
    })
  }, [])

  const handle = async () => {
    setErr(''); setMsg(''); setLoading(true)
    if (!isSupabaseReady()) { setErr('Database not configured. Add Supabase env vars.'); setLoading(false); return }
    const sb = getSupabase()
    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/'
      } else {
        if (!username.trim()) throw new Error('Username is required')
        if (username.length < 3) throw new Error('Username must be at least 3 characters')
        if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error('Username: letters, numbers, underscores only')
        const { error } = await sb.auth.signUp({
          email, password,
          options: { data: { username: username.trim(), full_name: name.trim() } }
        })
        if (error) throw error
        setMsg('Account created! Check your email to confirm, then log in.')
        setMode('login')
      }
    } catch(e) { setErr(e.message) }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>{mode === 'login' ? 'Login' : 'Sign Up'} — TestZyro</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      </Head>
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box}
        body{background:#0a0e1a;font-family:'Inter',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
        .card{background:#141927;border:1px solid #2d3748;border-radius:20px;padding:40px;width:100%;max-width:420px;box-shadow:0 24px 80px rgba(0,0,0,.5)}
        .logo-row{display:flex;align-items:center;gap:10px;margin-bottom:32px;justify-content:center}
        .logo-mark{width:42px;height:42px;background:#6366f1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.9rem;color:white;font-family:'Inter',sans-serif}
        .logo-text{font-weight:800;font-size:1.2rem;color:white}
        .logo-text span{color:#6366f1}
        h2{font-size:1.4rem;font-weight:800;color:white;margin-bottom:6px;text-align:center}
        .sub{font-size:.82rem;color:#64748b;text-align:center;margin-bottom:28px}
        .field{margin-bottom:14px}
        label{display:block;font-size:.76rem;font-weight:600;color:#94a3b8;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
        input{width:100%;background:#1a2234;border:1.5px solid #2d3748;border-radius:10px;padding:11px 14px;color:white;font-family:'Inter',sans-serif;font-size:.9rem;outline:none;transition:border-color .15s}
        input:focus{border-color:#6366f1}
        .btn{width:100%;background:#6366f1;color:white;border:none;padding:13px;border-radius:10px;font-family:'Inter',sans-serif;font-weight:700;font-size:.92rem;cursor:pointer;margin-top:6px;transition:all .15s}
        .btn:hover{background:#5254cc}
        .btn:disabled{opacity:.5;cursor:not-allowed}
        .err{background:#3b1515;border:1px solid #ef4444;color:#ef4444;padding:10px 14px;border-radius:8px;font-size:.8rem;margin-bottom:14px}
        .ok{background:#0d2b1a;border:1px solid #10b981;color:#10b981;padding:10px 14px;border-radius:8px;font-size:.8rem;margin-bottom:14px}
        .toggle{text-align:center;margin-top:20px;font-size:.82rem;color:#64748b}
        .toggle a{color:#6366f1;cursor:pointer;font-weight:600;text-decoration:none}
        .toggle a:hover{color:#818cf8}
        .tabs{display:flex;gap:0;margin-bottom:24px;background:#0a0e1a;border-radius:10px;padding:4px}
        .tab{flex:1;padding:9px;border-radius:7px;text-align:center;font-size:.84rem;font-weight:600;cursor:pointer;color:#64748b;transition:all .15s}
        .tab.on{background:#6366f1;color:white}
        .divider{border:none;border-top:1px solid #2d3748;margin:20px 0}
        .noconfig{background:#1e293b;border:1px solid #f97316;color:#f97316;padding:14px;border-radius:10px;font-size:.8rem;margin-bottom:20px;line-height:1.6}
        .noconfig strong{display:block;margin-bottom:6px}
      `}</style>
      <div className="card">
        <div className="logo-row">
          <div className="logo-mark">TZ</div>
          <span className="logo-text">Test<span>Zyro</span></span>
        </div>
        {!isSupabaseReady() && (
          <div className="noconfig">
            <strong>⚠️ Database not configured</strong>
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your environment variables. See README for setup instructions.
          </div>
        )}
        <div className="tabs">
          <div className={`tab${mode==='login'?' on':''}`} onClick={()=>{setMode('login');setErr('');setMsg('')}}>Log In</div>
          <div className={`tab${mode==='signup'?' on':''}`} onClick={()=>{setMode('signup');setErr('');setMsg('')}}>Sign Up</div>
        </div>
        {err && <div className="err">{err}</div>}
        {msg && <div className="ok">{msg}</div>}
        {mode === 'signup' && (
          <>
            <div className="field">
              <label>Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/>
            </div>
            <div className="field">
              <label>Username</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. john_doe" autoCapitalize="none"/>
            </div>
          </>
        )}
        <div className="field">
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoCapitalize="none"/>
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==='Enter'&&handle()}/>
        </div>
        <button className="btn" onClick={handle} disabled={loading||!isSupabaseReady()}>
          {loading ? 'Please wait…' : mode==='login' ? 'Log In' : 'Create Account'}
        </button>
        <hr className="divider"/>
        <div className="toggle">
          <Link href="/" style={{color:'#64748b',textDecoration:'none'}}>← Back to Library</Link>
        </div>
      </div>
    </>
  )
}
