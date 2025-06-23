const supabase = require('../db')

exports.createUsage = async (req, res) => {
  const { user_id, question, response, model, tokens_in, tokens_out, cost_usd, cost_krw, meta } = req.body
  const { data, error } = await supabase
    .from('llm_usage')
    .insert([{ user_id, question, response, model, tokens_in, tokens_out, cost_usd, cost_krw, meta }])
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

exports.getAllUsage = async (req, res) => {
  const { data, error } = await supabase.from('llm_usage').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

exports.getUsageById = async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase.from('llm_usage').select('*').eq('id', id).single()
  if (error) return res.status(404).json({ error: 'Usage not found' })
  res.json(data)
}

exports.updateUsage = async (req, res) => {
  const { id } = req.params
  const { response } = req.body
  const { data, error } = await supabase
    .from('llm_usage')
    .update({ response })
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}

exports.deleteUsage = async (req, res) => {
  const { id } = req.params
  const { data, error } = await supabase
    .from('llm_usage')
    .delete()
    .eq('id', id)
    .select()
    .single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
}
