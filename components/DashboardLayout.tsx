import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const DashboardLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen bg-ops-dark text-slate-200 font-sans selection:bg-ops-accent selection:text-ops-dark">
      <div className="max-w-[1600px] mx-auto border-x border-slate-800 min-h-screen shadow-2xl shadow-black">
        <div className="grid grid-cols-12">
          {children}
        </div>
      </div>
    </div>
  );
};
