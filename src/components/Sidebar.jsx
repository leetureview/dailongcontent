import React from 'react';
import { Sun, Moon, ChevronDown } from 'lucide-react';
import { menuItems } from '../data/menuItems';

const Sidebar = ({ darkMode, setDarkMode, activeMenu, setActiveMenu }) => {
    return (
        <aside className={`w-64 min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'} border-r ${darkMode ? 'border-gray-800' : 'border-gray-200'} shadow-card`}>
            {/* Logo */}
            <div className={`p-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">D</span>
                    </div>
                    <div>
                        <h1 className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            DAILONG MEDIA
                        </h1>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            AGENCY
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {menuItems.map((group, groupIndex) => (
                    <div key={groupIndex} className="mb-4">
                        <h3 className={`px-4 text-xs font-semibold mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'} uppercase tracking-wider`}>
                            {group.group}
                        </h3>
                        <ul>
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeMenu === item.id;
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => setActiveMenu(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${isActive
                                                    ? darkMode
                                                        ? 'bg-primary-900/50 text-primary-400 border-r-2 border-primary-500'
                                                        : 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                                                    : darkMode
                                                        ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon size={18} className={isActive ? '' : 'opacity-70'} />
                                            <span className="font-medium">{item.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Dark Mode Toggle */}
            <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${darkMode
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                >
                    <span className="text-sm font-medium">
                        {darkMode ? 'Chế độ tối' : 'Chế độ sáng'}
                    </span>
                    {darkMode ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
