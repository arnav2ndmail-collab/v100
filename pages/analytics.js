import { useState, useEffect } from 'react'
import Head from 'next/head'
import { getSupabase, isSupabaseReady } from '../lib/supabase'

const SUBJECTS = ['Overall','Physics','Chemistry','Maths','English & LR']
const SUBJ_ICONS = { Overall:'✓', Physics:'⚛', Chemistry:'🧪', Maths:'∑', 'English & LR':'A' }
const SUBJ_COLORS = { Overall:'#6366f1', Physics:'#10b981', Chemistry:'#f97316', Maths:'#06b6d4', 'English & LR':'#8b5cf6' }

function pct(a,b){ return b?Math.round(a/b*100):0 }
function fmtDate(iso){ try{ return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) }catch(e){return iso} }
function fmtTime(s){ if(!s)return '--'; const m=Math.floor(s/60); return m>0?`${m}m ${s%60}s`:`${s}s` }

export default function Analytics() {
  const [user, setUser] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [section, setSection] = useState('Performance')
  const [filterN, setFilterN] = useState(0) // 0=all, 3, 5, 10
  const [activeSubj, setActiveSubj] = useState('Overall')
  const [showPct, setShowPct] = useState(true)

  useEffect(() => {
    if (!isSupabaseReady()) { setLoading(false); return }
    const sb = getSupabase()
    sb.auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/login'; return }
      setUser(data.session.user)
      // Load attempts
      sb.from('test_attempts')
        .select('*')
        .eq('user_id', data.session.user.id)
        .order('taken_at', { ascending: false })
        .then(({ data: rows }) => {
          setAttempts(rows || [])
          setLoading(false)
        })
    })
  }, [])

  const logout = async () => {
    await getSupabase().auth.signOut()
    window.location.href = '/login'
  }

  const filtered = filterN > 0 ? attempts.slice(0, filterN) : attempts

  // Compute aggregate stats from real attempts
  const stats = (() => {
    if (!filtered.length) return null
    const total = filtered.length
    const avgScore = Math.round(filtered.reduce((s,a)=>s+pct(a.score,a.max_score),0)/total)
    const avgCorrect = Math.round(filtered.reduce((s,a)=>s+pct(a.correct,a.correct+a.wrong+a.skipped+a.unattempted),0)/total)
    const avgWrong = Math.round(filtered.reduce((s,a)=>s+pct(a.wrong,a.correct+a.wrong+a.skipped+a.unattempted),0)/total)
    const avgNA = Math.round(filtered.reduce((s,a)=>s+pct(a.unattempted,a.correct+a.wrong+a.skipped+a.unattempted),0)/total)

    const subjData = {}
    SUBJECTS.forEach(s => {
      if (s === 'Overall') return
      const rows = filtered.filter(a => a.subj_stats && a.subj_stats[s])
      if (!rows.length) return
      const sc = rows.map(a => a.subj_stats[s])
      subjData[s] = {
        avgScore: Math.round(sc.reduce((sum,x)=>sum+pct(x.cor*3-x.wrg,((x.cor+x.wrg+x.skp+x.un)*3)),0)/sc.length),
        correct: Math.round(sc.reduce((sum,x)=>sum+pct(x.cor,x.cor+x.wrg+x.skp+x.un),0)/sc.length),
        wrong: Math.round(sc.reduce((sum,x)=>sum+pct(x.wrg,x.cor+x.wrg+x.skp+x.un),0)/sc.length),
      }
    })
    return { avgScore, avgCorrect, avgWrong, avgNA, subjData }
  })()

  const sections = ['Performance','Timeline','Qs Type Breakup','Quality of Attempts','Time Analysis','Difficulty Analysis','Chapter Analysis']

  return (
    <>
      <Head>
        <title>Analytics — TestZyro</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      </Head>
      <style>{CSS}</style>

      <div className="shell">
        {/* Left icon sidebar */}
        <div className="icon-sidebar">
          <div className="is-logo">TZ</div>
          <div className="is-links">
            {[
              {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, href:'/'},
              {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>, href:'/'},
              {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>, href:'/analytics', active:true},
              {icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>, href:'/bookmarks'},
            ].map((l,i)=>(
              <a key={i} href={l.href} className={`is-link${l.active?' active':''}`}>{l.icon}</a>
            ))}
          </div>
          <button className="is-logout" onClick={logout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>

        {/* Left analysis panel */}
        <div className="analysis-panel">
          <div className="ap-header">
            <div className="ap-exam-name">BITSAT Series</div>
            <div className="ap-exam-sub">Full Test Series</div>
          </div>
          <div className="ap-menu">
            {sections.map(s=>(
              <div key={s} className={`ap-item${section===s?' active':''}`} onClick={()=>setSection(s)}>
                <span>{s}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          {loading ? (
            <div className="loading-state">Loading your analytics…</div>
          ) : !isSupabaseReady() ? (
            <div className="no-db">
              <h2>Database not configured</h2>
              <p>Add Supabase environment variables to enable analytics. See README.md for setup.</p>
              <a href="/" className="back-btn">← Back to Tests</a>
            </div>
          ) : !attempts.length ? (
            <div className="no-data">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2d3748" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              <h2>No tests given yet</h2>
              <p>Give some tests first, then come back here to see your analytics.</p>
              <a href="/" className="back-btn">← Start a Test</a>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="content-hdr">
                <h1 className="content-title">{section}</h1>
                <div className="filter-tabs">
                  {[[0,'All Tests'],[3,'Last 3'],[5,'Last 5'],[10,'Last 10']].map(([n,l])=>(
                    <button key={n} className={`ftab${filterN===n?' on':''}`} onClick={()=>setFilterN(n)}>{l}</button>
                  ))}
                </div>
              </div>

              {section === 'Performance' && stats && (
                <>
                  {/* Summary card */}
                  <div className="card">
                    <h3 className="card-title">Summary</h3>
                    <div className="summary-grid">
                      {[
                        {l:'Average Score', v:stats.avgScore+'%', c:'#f59e0b', w:stats.avgScore},
                        {l:'Attempted Correct', v:stats.avgCorrect+'%', c:'#10b981', w:stats.avgCorrect},
                        {l:'Attempted Wrong', v:stats.avgWrong+'%', c:'#ef4444', w:stats.avgWrong},
                        {l:'Not Attempted', v:stats.avgNA+'%', c:'#6366f1', w:stats.avgNA},
                      ].map(({l,v,c,w})=>(
                        <div key={l} className="summary-item">
                          <div className="si-label">{l}</div>
                          <div className="si-value" style={{color:c}}>{v}</div>
                          <div className="si-bar"><div className="si-fill" style={{width:w+'%',background:c}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subject cards */}
                  <div className="card">
                    <div className="subj-cards">
                      {SUBJECTS.map(s => {
                        const d = s==='Overall' ? {avgScore:stats.avgScore, correct:stats.avgCorrect, wrong:stats.avgWrong} : stats.subjData[s]
                        if (!d && s!=='Overall') return null
                        return (
                          <div key={s} className="subj-card">
                            <div className="sc-hdr">
                              <span style={{color:SUBJ_COLORS[s],fontSize:18}}>{SUBJ_ICONS[s]}</span>
                              <span className="sc-name">{s}</span>
                            </div>
                            {d && <>
                              <div className="sc-stat"><div className="sc-lbl">Avg Score</div><div className="sc-val" style={{color:'#f59e0b'}}>{d.avgScore}%</div></div>
                              <div className="sc-stat"><div className="sc-lbl">Correct</div><div className="sc-val" style={{color:'#10b981'}}>{d.correct}%</div></div>
                              <div className="sc-stat"><div className="sc-lbl">Wrong</div><div className="sc-val" style={{color:'#ef4444'}}>{d.wrong}%</div></div>
                            </>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Test-wise breakdown */}
                  <div className="card">
                    <div className="card-hdr">
                      <h3 className="card-title">Test-wise Breakdown</h3>
                      <div className="toggle-row">
                        <span style={{fontSize:'.78rem',color:'#94a3b8'}}>Show %</span>
                        <div className={`toggle${showPct?' on':''}`} onClick={()=>setShowPct(p=>!p)}>
                          <div className="toggle-knob"/>
                        </div>
                      </div>
                    </div>
                    <div className="subj-tabs">
                      {SUBJECTS.map(s=>(
                        <button key={s} className={`stab${activeSubj===s?' on':''}`} onClick={()=>setActiveSubj(s)} style={activeSubj===s?{borderColor:SUBJ_COLORS[s],color:SUBJ_COLORS[s]}:{}}>
                          <span style={{color:SUBJ_COLORS[s]}}>{SUBJ_ICONS[s]}</span> {s}
                        </button>
                      ))}
                    </div>
                    <div className="test-table">
                      <div className="tt-head">
                        <div>Test</div>
                        <div style={{color:'#f59e0b'}}>Score</div>
                        <div style={{color:'#10b981'}}>Correct</div>
                        <div style={{color:'#ef4444'}}>Wrong</div>
                        <div style={{color:'#6366f1'}}>Not Att.</div>
                        <div style={{color:'#64748b'}}>Skipped</div>
                      </div>
                      {filtered.map((att, i) => {
                        const maxQ = att.correct + att.wrong + att.skipped + att.unattempted
                        const scorePct = pct(att.score, att.max_score)
                        return (
                          <div key={i} className="tt-row">
                            <div>
                              <div className="tt-name">{att.test_title}</div>
                              <div className="tt-date">{fmtDate(att.taken_at)}</div>
                            </div>
                            <div className="tt-val" style={{color:'#f59e0b'}}>
                              {showPct ? scorePct+'%' : `${att.score}/${att.max_score}`}
                              <div className="tt-bar" style={{height:Math.max(4,scorePct/3)+'px',background:'#f59e0b'}}/>
                            </div>
                            <div className="tt-val" style={{color:'#10b981'}}>
                              {showPct ? pct(att.correct,maxQ)+'%' : `${att.correct}/${maxQ}`}
                              <div className="tt-bar" style={{height:Math.max(4,pct(att.correct,maxQ)/3)+'px',background:'#10b981'}}/>
                            </div>
                            <div className="tt-val" style={{color:'#ef4444'}}>
                              {showPct ? pct(att.wrong,maxQ)+'%' : `${att.wrong}/${maxQ}`}
                              <div className="tt-bar" style={{height:Math.max(4,pct(att.wrong,maxQ)/3)+'px',background:'#ef4444'}}/>
                            </div>
                            <div className="tt-val" style={{color:'#6366f1'}}>
                              {showPct ? pct(att.unattempted,maxQ)+'%' : `${att.unattempted}/${maxQ}`}
                              <div className="tt-bar" style={{height:Math.max(4,pct(att.unattempted,maxQ)/3)+'px',background:'#6366f1'}}/>
                            </div>
                            <div className="tt-val" style={{color:'#64748b'}}>
                              {showPct ? pct(att.skipped,maxQ)+'%' : `${att.skipped}/${maxQ}`}
                              <div className="tt-bar" style={{height:Math.max(4,pct(att.skipped,maxQ)/3)+'px',background:'#64748b'}}/>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {section !== 'Performance' && (
                <div className="coming-soon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2d3748" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <h2>{section}</h2>
                  <p>Coming soon — give more tests to unlock this analysis.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

const CSS = `
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0e1a;color:#fff;font-family:'Inter',sans-serif;min-height:100vh}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#2d3748;border-radius:2px}
.shell{display:flex;height:100vh;overflow:hidden}
/* Icon sidebar */
.icon-sidebar{width:72px;flex-shrink:0;background:#141927;border-right:1px solid #1e293b;display:flex;flex-direction:column;align-items:center;padding:16px 0;gap:0}
.is-logo{width:38px;height:38px;background:#6366f1;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.82rem;color:white;margin-bottom:24px}
.is-links{display:flex;flex-direction:column;gap:4px;flex:1}
.is-link{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#64748b;text-decoration:none;transition:all .15s}
.is-link:hover{background:#1e293b;color:#94a3b8}
.is-link.active{background:#1e293b;color:#6366f1}
.is-logout{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#64748b;background:none;border:none;cursor:pointer;transition:all .15s}
.is-logout:hover{background:#1e293b;color:#ef4444}
/* Analysis panel */
.analysis-panel{width:220px;flex-shrink:0;background:#0d1220;border-right:1px solid #1e293b;display:flex;flex-direction:column;overflow:hidden}
.ap-header{padding:20px 16px 14px;border-bottom:1px solid #1e293b}
.ap-exam-name{font-weight:700;font-size:.92rem;color:white;margin-bottom:2px}
.ap-exam-sub{font-size:.74rem;color:#64748b}
.ap-menu{padding:8px 8px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;flex:1}
.ap-item{display:flex;align-items:center;justify-content:space-between;padding:9px 10px;border-radius:8px;cursor:pointer;color:#94a3b8;font-size:.8rem;font-weight:500;transition:all .15s;gap:8px}
.ap-item:hover{background:#141927;color:white}
.ap-item.active{background:#1e293b;color:#6366f1}
/* Main */
.main-content{flex:1;overflow-y:auto;padding:24px;background:#0a0e1a}
.content-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px}
.content-title{font-size:1.4rem;font-weight:800;color:white}
.filter-tabs{display:flex;gap:6px;flex-wrap:wrap}
.ftab{padding:6px 16px;border-radius:20px;background:transparent;border:1.5px solid #2d3748;color:#64748b;font-family:'Inter',sans-serif;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .15s}
.ftab:hover{border-color:#6366f1;color:#6366f1}
.ftab.on{background:#6366f1;border-color:#6366f1;color:white}
/* Cards */
.card{background:#141927;border:1px solid #1e293b;border-radius:14px;padding:20px;margin-bottom:16px}
.card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px}
.card-title{font-size:.92rem;font-weight:700;color:white;margin-bottom:14px}
/* Summary */
.summary-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.summary-item{background:#0d1220;border-radius:10px;padding:14px}
.si-label{font-size:.72rem;color:#64748b;margin-bottom:6px;font-weight:500}
.si-value{font-size:1.5rem;font-weight:800;font-family:'Inter',sans-serif;margin-bottom:8px}
.si-bar{height:4px;background:#1e293b;border-radius:99px;overflow:hidden}
.si-fill{height:100%;border-radius:99px;transition:width .6s}
/* Subject cards */
.subj-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.subj-card{background:#0d1220;border:1px solid #1e293b;border-radius:12px;padding:14px}
.sc-hdr{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.sc-name{font-size:.82rem;font-weight:700;color:white}
.sc-stat{margin-bottom:6px}
.sc-lbl{font-size:.62rem;color:#64748b;margin-bottom:2px}
.sc-val{font-size:1.4rem;font-weight:800}
/* Subject tabs */
.subj-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.stab{padding:6px 14px;border-radius:20px;background:transparent;border:1.5px solid #2d3748;color:#64748b;font-family:'Inter',sans-serif;font-size:.76rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:5px;transition:all .15s}
.stab:hover{border-color:#6366f1;color:#6366f1}
.stab.on{background:#1e293b}
/* Test table */
.test-table{border-radius:10px;overflow:hidden;border:1px solid #1e293b}
.tt-head{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1fr;padding:10px 14px;background:#0d1220;font-size:.68rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px}
.tt-row{display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 1fr;padding:12px 14px;border-top:1px solid #1e293b;align-items:end;transition:background .12s}
.tt-row:hover{background:#141927}
.tt-name{font-size:.82rem;font-weight:600;color:white;margin-bottom:2px}
.tt-date{font-size:.68rem;color:#64748b}
.tt-val{font-weight:700;font-size:.88rem;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.tt-bar{width:6px;border-radius:99px;min-height:4px;transition:height .3s}
/* Toggle */
.toggle-row{display:flex;align-items:center;gap:8px}
.toggle{width:36px;height:20px;background:#2d3748;border-radius:10px;cursor:pointer;position:relative;transition:background .2s}
.toggle.on{background:#6366f1}
.toggle-knob{width:16px;height:16px;background:white;border-radius:50%;position:absolute;top:2px;left:2px;transition:left .2s}
.toggle.on .toggle-knob{left:18px}
/* States */
.loading-state,.no-data,.no-db,.coming-soon{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:14px;color:#64748b;text-align:center}
.no-data h2,.no-db h2,.coming-soon h2{color:white;font-size:1.2rem}
.no-data p,.no-db p,.coming-soon p{font-size:.84rem;max-width:360px;line-height:1.6}
.back-btn{margin-top:8px;background:#6366f1;color:white;border:none;padding:10px 24px;border-radius:8px;font-family:'Inter',sans-serif;font-weight:700;font-size:.84rem;cursor:pointer;text-decoration:none}
`
