import Link from 'next/link'

export default function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
			<div className="max-w-md w-full p-8 bg-white dark:bg-neutral-800 rounded-sm shadow">
				<h1 className="text-2xl font-bold mb-4">Login</h1>
				<p className="text-neutral-600 dark:text-neutral-400 mb-6">Please use Google to sign in as an admin.</p>
				<Link
					href="/admin"
					className="inline-block w-full text-center px-4 py-3 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
				>
					Sign in (Admin)
				</Link>
			</div>
		</div>
	)
}
