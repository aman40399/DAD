
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

export default async function AdminSessionDebug() {
  const session = await getServerSession(authOptions)
  return (
    <div style={{ padding: 32 }}>
      <h1>NextAuth Session Debug</h1>
      <pre style={{ background: '#222', color: '#fff', padding: 16, borderRadius: 8 }}>
        {JSON.stringify(session, null, 2)}
      </pre>
      <p>Check your browser cookies for <code>next-auth.session-token</code> (JWT) or <code>__Secure-next-auth.session-token</code> (if using HTTPS).</p>
      <p>If session is null, you are not logged in or your session is not being sent to the server.</p>
    </div>
  )
}
