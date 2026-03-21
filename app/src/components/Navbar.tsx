import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <header className="h-14 shrink-0 border-b border-gray-200 bg-white">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900">NYC Rent Prices</Link>
        <nav className="flex items-center gap-4 text-sm text-gray-700">
          <Link className="hover:text-gray-900" to="/">Map</Link>
          <Link className="hover:text-gray-900" to="/about">About</Link>
        </nav>
      </div>
    </header>
  );
}