export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#0d0b06]">
      <section className="py-6 md:py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-7 lg:space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Privacy Policy
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Homilivo collects basic user information for
                subscription and support purposes.
                Payments are securely processed via Razorpay.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}