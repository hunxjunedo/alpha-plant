export default function Home() {
  return (
    <div className="flex items-center flex-col justify-center min-h-screen">
      <a href="/admin" className="text-lg font-semibold hover:underline text-primary">
        Go to Admin Dashboard →
      </a>
      <a href="/login" className="text-lg font-semibold hover:underline text-primary">
        Go to User Dashboard →
      </a>
    </div>
  )
}
