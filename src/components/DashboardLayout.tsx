import React, { ReactNode } from 'react';

/**
 * Props for the DashboardLayout component.
 */
interface Props {
  /** Child elements to render within the layout */
  children: ReactNode;
}

/**
 * Main layout wrapper for the DNS Sentinel dashboard.
 * Provides consistent styling and structure for the application.
 * 
 * @param props - Component props
 * @param props.children - Child elements to render
 */
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
