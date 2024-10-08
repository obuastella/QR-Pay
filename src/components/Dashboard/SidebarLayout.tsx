import { Outlet } from 'react-router-dom';
import Sidebar from './component/Sidebar';
import { RenderHeaderContent } from './component/RenderHeaderContent';

const SidebarLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-[#040428] flex flex-col xl:pr-3 pr-0 pb-3">
          <header className="text-white xl:py-7 py-5 px-4 xl:px-6">
            {RenderHeaderContent()}
          </header>
          <div className="flex-1 bg-white rounded-[24px] overflow-y-auto pb-20 xl:pb-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
