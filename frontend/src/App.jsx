import Index from './pages/Index';
import About_us from './pages/About_us';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    // Usamos un Fragmento (<>) para envolver todo en un único elemento raíz
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about_us" element={<About_us />} />
        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        {/* --- Rutas Protegidas (Solo para usuarios con login) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;