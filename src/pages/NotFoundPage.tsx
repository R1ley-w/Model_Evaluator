import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <h1 className="text-3xl font-bold">Not found</h1>
      <p className="text-neutral-500">That entry doesn&apos;t exist in the dataset.</p>
      <Link to="/" className="text-indigo-500 hover:underline">
        Back to overview
      </Link>
    </div>
  )
}
