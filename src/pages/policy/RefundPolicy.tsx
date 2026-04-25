export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#0d0b06]">
      <section className="py-6 md:py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-7 lg:space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Refund & Cancellation Policy
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Homilivo provides subscription-based digital services
                that allow tenants to access verified property owner
                contact details and rental listings.
              </p>

              <h2>Subscription Nature</h2>
              <p>
                Subscription plans provide instant digital access to
                property owner contact information. Once access is
                granted, the service is considered delivered.
              </p>

              <h2>Refund Eligibility</h2>
              <p>
                Subscription fees are generally non-refundable once
                access to owner contact details or platform features
                has been provided.
              </p>

              <h2>Failed or Duplicate Transactions</h2>
              <p>
                In case of failed payments or duplicate transactions,
                eligible refunds will be processed within 5–7 business
                days to the original payment method.
              </p>

              <h2>Cancellation Policy</h2>
              <p>
                Users may discontinue using the subscription service
                at any time. However, cancellation will not result in
                refunds for the active subscription period.
              </p>

              <h2>Contact for Refund Requests</h2>
              <p>
                For payment-related concerns, users may contact us at:<br />
                <strong>Email:</strong> support@homilivo.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}