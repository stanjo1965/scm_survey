import { supabase } from '../lib/supabase'

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('posts') // 'posts' 테이블에서 데이터를 가져옵니다.
    .select('*')

  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to fetch data' })
  }

  res.status(200).json(data)
}