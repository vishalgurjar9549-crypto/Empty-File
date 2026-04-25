export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-[#f8f6f1] dark:bg-[#0d0b06]">
      <section className="py-6 md:py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 sm:space-y-7 lg:space-y-8">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              Terms & Conditions
            </h1>

            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Welcome to Homilivo. By accessing or using our platform, you agree to
                comply with and be bound by the following terms and conditions.
              </p>

              <h2>Platform Services</h2>

              <p>
                Homilivo provides a digital platform that allows tenants to purchase
                subscription plans to access verified property owner contact details and
                rental listings.
              </p>

              <p>
                Homilivo does not participate in rental agreements or collect rent
                payments between tenants and property owners. All rental transactions
                occur directly between users.
              </p>

              <h2>User Responsibilities</h2>
              <p>
                Users agree to provide accurate information while registering and using
                the platform. Any misuse, fraudulent activity or violation may result in
                account suspension.
              </p>

              <h2>Payments</h2>
              <p>
                Subscription payments are securely processed through Razorpay. Homilivo
                does not collect rental payments between tenants and property owners.
              </p>

              <h2>Modifications</h2>
              <p>
                Homilivo reserves the right to update or modify these terms at any time
                without prior notice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
