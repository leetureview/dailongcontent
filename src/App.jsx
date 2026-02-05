import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SidePanel from './components/SidePanel';
import ResultTable from './components/ResultTable';
import SetupPrompt from './pages/SetupPrompt';

function App() {
    const [darkMode, setDarkMode] = useState(false);
    const [activeMenu, setActiveMenu] = useState('content-ai');
    const [activeTab, setActiveTab] = useState('write-comment');
    const [refreshKey, setRefreshKey] = useState(0);

    // Refresh handler 
    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Render main content based on active menu
    const renderContent = () => {
        switch (activeMenu) {
            case 'setup-prompt':
                return <SetupPrompt darkMode={darkMode} projectId={1} />;
            case 'content-ai':
            default:
                return (
                    <div className="flex-1 flex">
                        {/* Side Panel */}
                        <SidePanel
                            darkMode={darkMode}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                        {/* Result Table */}
                        <ResultTable
                            key={refreshKey}
                            darkMode={darkMode}
                            projectId={1}
                        />
                    </div>
                );
        }
    };

    return (
        <div className={`min-h-screen flex ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            {/* Sidebar */}
            <Sidebar
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Header */}
                <Header darkMode={darkMode} onRefresh={handleRefresh} />

                {/* Content */}
                {renderContent()}
            </div>
        </div>
    );
}

export default App;
