import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BG } from './theme';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import CalendarPage from './pages/CalendarPage';
import Staff from './pages/Staff';
import Finance from './pages/Finance';
import Activities from './pages/Activities';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <main style={{ background: '#08080f', marginLeft: 256, padding: 24, flex: 1, minHeight: '100vh' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>{children}</div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/members" element={<Layout><Members /></Layout>} />
        <Route path="/calendar" element={<Layout><CalendarPage /></Layout>} />
        <Route path="/staff" element={<Layout><Staff /></Layout>} />
        <Route path="/finance" element={<Layout><Finance /></Layout>} />
        <Route path="/activities" element={<Layout><Activities /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
