import {
    LayoutDashboard,
    FileText,
    Sparkles,
    Settings,
    Users,
    CheckCircle,
    Camera,
    Wrench,
    Brain,
    Cog,
    BarChart3
} from 'lucide-react';

export const menuItems = [
    {
        group: 'GENERAL',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: false },
            { id: 'reports', label: 'Báo cáo', icon: BarChart3, active: false },
        ]
    },
    {
        group: 'CONTENT',
        items: [
            { id: 'content-ai', label: 'Content AI', icon: Sparkles, active: true },
            { id: 'setup-prompt', label: 'Setup Prompt', icon: Settings, active: false },
        ]
    },
    {
        group: 'SEEDER',
        items: [
            { id: 'check-seeding', label: 'Check Seeding', icon: CheckCircle, active: false },
            { id: 'capture-report', label: 'Chụp ảnh Report', icon: Camera, active: false },
        ]
    },
    {
        group: 'CÔNG CỤ',
        items: [
            { id: 'tools', label: 'Công cụ', icon: Wrench, active: false },
            { id: 'ai-plan', label: 'AI Plan', icon: Brain, active: false },
        ]
    },
    {
        group: 'CÀI ĐẶT CHUNG',
        items: [
            { id: 'staff', label: 'Nhân sự', icon: Users, active: false },
            { id: 'settings', label: 'Cài đặt chung', icon: Cog, active: false },
        ]
    }
];

export const sidePanelTabs = [
    { id: 'documents', label: 'Tài liệu', count: null },
    { id: 'write-post', label: 'Viết post', count: 0 },
    { id: 'write-comment', label: 'Viết comment', count: 3, active: true },
    { id: 'write-couple', label: 'Viết cmt cho Couple', count: null },
];
