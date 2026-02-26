import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const url = 'http://localhost:5000/api/users/register';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registered!");
                localStorage.setItem('userInfo', JSON.stringify(data)); // Save user session
                navigate('/dashboard'); // Redirect after success
            } else {
                alert(data.message || "Something went wrong");
            }
        } catch (error) {
            console.error("Auth Error:", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email" placeholder="Email" required
                        className="border p-3 rounded shadow-sm focus:ring-2 focus:ring-green-500"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />
                    <input
                        type="password" placeholder="Password" required
                        className="border p-3 rounded shadow-sm focus:ring-2 focus:ring-green-500"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                    <button type="submit" className="bg-green-600 text-white font-bold py-3 rounded hover:bg-green-700 transition">
                        Join Now
                    </button>
                </form>
                <p className="mt-4 text-center text-sm">
                    Already have an account?
                    <Link to="/login" className="text-green-600 font-bold ml-1">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
