import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Users, FileText, ShieldAlert, 
  Briefcase, Wrench, ChevronLeft, ChevronRight,
  Zap, Bot } from 'lucide-react';

export default function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const menuItems = [
    { name: t('dashboard', 'Dashboard'), icon: <LayoutDashboard size={16}/>, path: '/dashboard' },
    { name: 'AI Assistant',              icon: <Bot size={16}/>,              path: '/ai', tag: 'New' },
    { name: t('jobs', 'Work Orders'),    icon: <Briefcase size={16}/>,        path: '/jobs' },
    { name: t('customers', 'Customers'), icon: <Users size={16}/>,            path: '/customers' },
    { name: t('invoices', 'Invoices'),   icon: <FileText size={16}/>,         path: '/invoices' },
    { name: t('services', 'Services'),   icon: <Wrench size={16}/>,           path: '/services' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ 
      name: t('admin_panel', 'Admin Panel'), 
      icon: <ShieldAlert size={16} />, 
      path: '/admin' 
    });
  }

  const sidebarWidth = collapsed ? 'w-[60px]' : 'w-[220px]';
  
  return (
    <aside className={`${sidebarWidth} h-screen sticky top-0 bg-white dark:bg-[#0f0f11] border-r border-gray-200 dark:border-white/[0.06] transition-[width] duration-200 ease-in-out flex flex-col z-50`}>
      
      {/* ── Brand Section ── */}
      <div className={`h-14 px-3 flex items-center border-b border-gray-100 dark:border-white/[0.06] ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
              <Zap size={13} className="text-white dark:text-gray-900" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-gray-900 dark:text-white">
              FlowPOS
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-6 h-6 rounded-md bg-gray-900 dark:bg-white flex items-center justify-center">
            <Zap size={13} className="text-white dark:text-gray-900" />
          </div>
        )}
        {!collapsed && (
          <button 
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              localStorage.setItem('sidebar_collapsed', next);
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Collapsed expand button */}
      {collapsed && (
        <button
          onClick={() => {
            setCollapsed(false);
            localStorage.setItem('sidebar_collapsed', false);
          }}
          className="mx-auto mt-2 p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 pt-2 pb-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-gray-100 dark:bg-white/8 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-800 dark:hover:text-white font-normal',
                collapsed ? 'justify-center' : '',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex-shrink-0 transition-colors duration-150 ${isActive ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="flex-1 flex items-center justify-between min-w-0">
                    <span className="truncate">{item.name}</span>
                    {item.tag && (
                      <span className="ml-2 flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20">
                        {item.tag}
                      </span>
                    )}
                  </span>
                )}
                {collapsed && isActive && (
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Sidebar Footer ── */}
      <div className="p-2 border-t border-gray-100 dark:border-white/[0.06]">
        <div className={`flex items-center gap-2.5 px-1 py-1.5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-[13px] font-medium text-gray-900 dark:text-white truncate leading-none mb-0.5">{user?.name || 'Staff'}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none">{user?.role || 'User'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}