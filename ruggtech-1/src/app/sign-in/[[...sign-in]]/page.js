import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a'
    }}>
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
            card: 'shadow-2xl',
          }
        }}
      />
    </div>
  )
}