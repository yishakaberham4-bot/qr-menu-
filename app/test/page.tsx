import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.from('test').select('*').limit(1)

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Supabase Connection Test</h1>

      {error ? (
        <div style={{ color: 'red', marginTop: '20px' }}>
          <p><strong>Error:</strong> {error.message}</p>
          <p>This is normal if the table "test" does not exist yet.</p>
        </div>
      ) : (
        <div style={{ color: 'green', marginTop: '20px' }}>
          <p>Connected to Supabase successfully!</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}