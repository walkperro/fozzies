import Link from "next/link";

export default function JoinTheTeamThankYouPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-12 text-center sm:px-6">
      <section className="w-full max-w-2xl border border-charcoal/10 bg-cream p-8 shadow-sm sm:p-10">
        <h1 className="font-serif text-4xl text-charcoal">Application Received</h1>
        <p className="mt-4 text-softgray">
          Thank you for applying to Fozzie&apos;s. We&apos;ll review your submission and reach out if it&apos;s a fit.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal no-underline transition hover:opacity-90"
        >
          Back to Home
        </Link>
      </section>
    </main>
  );
}
