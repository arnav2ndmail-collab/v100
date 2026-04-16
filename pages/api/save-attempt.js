import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(200).json({ ok: false, error: 'DB not configured' })
  }

  const sb = createClient(supabaseUrl, supabaseServiceKey)

  // Get user from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: authErr } = await sb.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' })

  const { testId, testPath, testTitle, subject, score, maxScore, correct, wrong, skipped, unattempted, accuracy, duration, marksCorrect, marksWrong, subjStats, answers } = req.body

  const { error } = await sb.from('test_attempts').insert({
    user_id: user.id,
    test_id: testId || testPath,
    test_path: testPath,
    test_title: testTitle,
    subject: subject || 'BITSAT',
    score, max_score: maxScore,
    correct, wrong,
    skipped: skipped || 0,
    unattempted: unattempted || 0,
    accuracy: accuracy || 0,
    duration: duration || 0,
    marks_correct: marksCorrect || 3,
    marks_wrong: marksWrong || 1,
    subj_stats: subjStats || {},
    answers: answers || [],
    taken_at: new Date().toISOString()
  })

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ ok: true })
}
