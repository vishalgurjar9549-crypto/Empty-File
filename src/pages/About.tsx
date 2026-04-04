
export function About() {
  return <div className="min-h-screen bg-cream dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-navy dark:text-white font-playfair mb-8 text-center">
          About Homilivo
        </h1>
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed mb-6 text-slate-600 dark:text-slate-300">
            Homilivo is India's premier managed accommodation platform,
            dedicated to transforming the way students and young professionals
            live. We believe that finding a home in a new city shouldn't be a
            struggle.
          </p>
          <p className="text-lg leading-relaxed mb-6 text-slate-600 dark:text-slate-300">
            Founded in 2024, we started with a simple mission: to provide safe,
            comfortable, and community-driven living spaces that feel like home.
            Today, we manage properties across multiple cities, serving thousands
            of happy residents nationwide.
          </p>
          <h3 className="text-xl font-bold text-navy dark:text-white mt-8 mb-4">
            Our Promise
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Zero Brokerage on all listings</li>
            <li>100% Verified properties and owners</li>
            <li>Standardized amenities across all homes</li>
            <li>24/7 Support and maintenance</li>
          </ul>
        </div>
      </div>
    </div>;
}