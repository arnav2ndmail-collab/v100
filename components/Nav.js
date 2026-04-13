import { useState, useEffect } from 'react'
import Link from 'next/link'

const NAV_LINKS = [
  { href:'/', label:'Library' },
  { href:'/analyser', label:'Analyser' },
  { href:'/solutions', label:'Solutions' },
  { href:'/bookmarks', label:'Bookmarks' },
  { href:'/migrate', label:'Migrate' },
  { href:'/admin', label:'Admin' },
]

export default function Nav({ active }) {
  const [dark, setDark] = useState(false)
  useEffect(()=>{ setDark(localStorage.getItem('tz_dark_mode')==='dark') },[])
  const toggleDark = () => {
    const next = !dark; setDark(next)
    localStorage.setItem('tz_dark_mode', next?'dark':'light')
    document.documentElement.setAttribute('data-theme', next?'dark':'')
  }
  return (
    <header className="shared-nav">
      <Link href="/" className="sn-logo">
        <div className="sn-mark">TZ</div>
        <span className="sn-txt">Test<span>Zyro</span></span>
      </Link>
      <nav className="sn-links">
        {NAV_LINKS.map(({href,label})=>(
          <Link key={href} href={href} className={`sn-link${active===label?' on':''}`}>{label}</Link>
        ))}
      </nav>
      <button className="sn-dark" onClick={toggleDark} title={dark?'Light':'Dark'}>
        {dark
          ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
          : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        }
      </button>
      <style>{`
        .shared-nav{background:#1a237e;padding:0 20px;display:flex;align-items:center;height:56px;gap:10px;box-shadow:0 2px 12px rgba(26,35,126,.4);position:sticky;top:0;z-index:100;font-family:'Inter',sans-serif}
        .sn-logo{display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0}
        .sn-mark{width:34px;height:34px;background:#fdd835;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.82rem;color:#1a237e;font-family:'JetBrains Mono',monospace}
        .sn-txt{font-weight:800;font-size:1.05rem;color:white;letter-spacing:-.3px}.sn-txt span{color:#fdd835}
        .sn-links{display:flex;align-items:center;gap:2px;flex:1;overflow-x:auto}
        .sn-link{padding:6px 12px;border-radius:6px;font-weight:500;font-size:.8rem;color:rgba(255,255,255,.75);text-decoration:none;transition:all .15s;white-space:nowrap;flex-shrink:0;font-family:'Inter',sans-serif}
        .sn-link:hover{color:white;background:rgba(255,255,255,.12)}
        .sn-link.on{background:rgba(255,255,255,.2);color:white;font-weight:700}
        .sn-dark{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:white;width:34px;height:34px;border-radius:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sn-dark:hover{background:rgba(255,255,255,.22)}
      `}</style>
    </header>
  )
}
