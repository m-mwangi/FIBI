import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token or user info for session management
        localStorage.setItem('userInfo', JSON.stringify(data));
        alert("Sign in successful!");
        navigate('/dashboard'); // Redirects to the dashboard route
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Server error. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-10">
      <h2 className="text-2xl font-bold mb-6">Login to FIBI</h2>
      <form onSubmit={handleSignIn} className="flex flex-col gap-4 w-full max-w-sm px-4">
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-3 rounded-md outline-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-3 rounded-md outline-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 transition">
          Sign In
        </button>
      </form>
      <p className="mt-4 text-sm">
        New to FIBI? <Link to="/register" className="text-green-600 font-bold hover:underline">Register here</Link>
      </p>
    </div>
  );
};

export default Login;