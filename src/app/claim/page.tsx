import Link from 'next/link'

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: 'The verification link is missing or invalid.',
  invalid_token: 'This verification link is invalid or has already been used.',
  token_expired: 'This verification link has expired.',
  missing_claim_email: 'No email address was found for this claim. Please start over.',
  auth_failed: 'Failed to create your account. Please try again.',
  checkout_failed: 'Failed to start checkout. Please try again.',
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function ClaimPage({ searchParams }: Props) {
  const { error } = await searchParams
  const message = error ? (ERROR_MESSAGES[error] ?? 'Something went wrong.') : null

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f9f5f0] px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Claim Your Listing</h1>
        {message ? (
          <>
            <p className="text-red-600 text-sm mb-6">{message}</p>
            <p className="text-gray-500 text-sm mb-6">
              Please search for your listing and try again.
            </p>
          </>
        ) : (
          <p className="text-gray-500 text-sm mb-6">
            Find your business listing on Melaa and click &quot;Claim this listing&quot; to get started.
          </p>
        )}
        <Link
          href="/"
          className="inline-block bg-[#E8760A] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#d06a09] transition-colors"
        >
          Browse Listings
        </Link>
      </div>
    </main>
  )
}
