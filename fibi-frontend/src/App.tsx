// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// import Projects from './pages/Projects';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import './index.css';
// import Navbar from './components/Navbar';
// import HeroSection from './components/HeroSection';
// import HowItWorks from './components/howitworks';
// import ProjectShowcase from './components/Projectshowcase';
// import Footer from './components/Footer';

// function App() {
//   return (
//     <Router>
//       <div className="flex min-h-svh flex-col">
//         <Navbar />
        
//         <main className="grow">
//           <Routes>
//             <Route
//               path="/"
//               element={
//                 <>
//                   <HeroSection />
//                   <HowItWorks />
//                   <ProjectShowcase />
//                 </>
//               }
//             />
//             <Route path="/projects" element={<Projects />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//           </Routes>
//         </main>

//         <Footer />
//       </div>
//     </Router>
//   );
// }

// export default App;



// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import AdminRoutes from "./admin/AdminRoutes";

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Navigate to="/admin" replace />} />
//         <Route path="/admin/*" element={<AdminRoutes />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
import { Link } from 'react-router-dom';

// Inside your Navbar return:
<Link to="/login">
  <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">
    Join an Investment
  </button>
</Link>
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminRoutes from "./admin/AdminRoutes";
import PublicRoutes from "./PublicRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<PublicRoutes />} />

        {/* Admin */}
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
