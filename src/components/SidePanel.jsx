import React from 'react';
import { sidePanelTabs } from '../data/menuItems';

const SidePanel = ({ darkMode, activeTab, setActiveTab }) => {
    return (
        <div className={`w-56 border-r ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} py-4`}>
            <ul className="space-y-1 px-3">
                {sidePanelTabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <li key={tab.id}>
                            <button
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isActive
                                        ? 'bg-primary-600 text-white shadow-md'
                                        : darkMode
                                            ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <span className="font-medium">{tab.label}</span>
                                {tab.count !== null && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive
                                            ? 'bg-white/20 text-white'
                                            : darkMode
                                                ? 'bg-gray-700 text-gray-300'
                                                : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SidePanel;
