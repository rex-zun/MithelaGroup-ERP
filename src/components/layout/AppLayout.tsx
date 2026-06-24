import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.1),_transparent_30%),#f8fafc]">
      <Sidebar />
      <div className="lg:pl-72">
        <TopHeader />
        <main className="px-4 py-6 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
