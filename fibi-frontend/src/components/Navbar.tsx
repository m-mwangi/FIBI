import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-primary flex items-center">
        <span className="mr-2">🌱</span>
        FIBI
      </Link>
      <div>
        <Link to="/login" className="text-gray-700 hover:text-primary mx-2">Sign In</Link>
        <Link 
          to="/invest" 
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Join an Investment
        </Link>
      </div>
    </nav>
  );
}