import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-transparent pb-14 lg:pb-2">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center">
        <h3 className="text-white font-semibold mb-3">Homilivo</h3>

        <div className="flex justify-center flex-wrap gap-5 text-sm text-gray-400">
          <Link to="/privacy-policy" className="hover:text-white">
            Privacy Policy
          </Link>

          <Link to="/terms-and-conditions" className="hover:text-white">
            Terms & Conditions
          </Link>

          <Link to="/refund-policy" className="hover:text-white">
            Refund Policy
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-500">
          © {new Date().getFullYear()} Homilivo
        </p>
      </div>
    </footer>
  );
}
