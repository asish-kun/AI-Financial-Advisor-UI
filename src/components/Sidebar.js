import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { Home, PieChart, BarChart2, User } from 'lucide-react';

const Sidebar = () => {
    return (
        <div className="sidebar h-screen w-64 bg-[#1f2a37] text-white flex flex-col">
            <div className="sidebar-header p-6 font-bold text-xl">
                AI Stock Advisor
            </div>
            <nav className="flex-1 space-y-2">
                <SidebarItem to="/advisor" icon={<Home className="w-6 h-6" />} label="Advisor" />
                <SidebarItem to="/portfolio" icon={<PieChart className="w-6 h-6" />} label="Portfolio" />
                <SidebarItem to="/dashboard" icon={<BarChart2 className="w-6 h-6" />} label="Dashboard" />
                <SidebarItem to="/account" icon={<User className="w-6 h-6" />} label="Account" />
            </nav>
        </div>
    );
};

const SidebarItem = ({ to, icon, label }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center p-4 hover:bg-[#2a3140] transition-colors ${isActive ? 'bg-[#2a3140] text-[#4ac1e0]' : ''
                }`
            }
        >
            {icon}
            <span className="ml-4">{label}</span>
        </NavLink>
    );
};

export default Sidebar;
