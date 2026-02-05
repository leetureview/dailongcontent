import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Sparkles, Copy, Check } from 'lucide-react';
import { promptsAPI } from '../api/client';

const SetupPrompt = ({ darkMode, projectId = 1 }) => {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Fetch prompts
    const fetchPrompts = async () => {
        try {
            setLoading(true);
            const response = await promptsAPI.getAll(projectId);
            setPrompts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, [projectId]);

    // Delete prompt
    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa prompt này?')) return;
        try {
            await promptsAPI.delete(id);
            fetchPrompts();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    // Add prompt
    const handleAdd = async (data) => {
        try {
            await promptsAPI.create({ ...data, project_id: projectId });
            setShowAddModal(false);
            fetchPrompts();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    // Update prompt
    const handleUpdate = async (id, data) => {
        try {
            await promptsAPI.update(id, data);
            setEditingPrompt(null);
            fetchPrompts();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const promptTypes = [
        { value: 'post', label: 'Viết Post', color: 'bg-blue-500' },
        { value: 'comment', label: 'Viết Comment', color: 'bg-green-500' },
        { value: 'couple', label: 'Comment Couple', color: 'bg-pink-500' },
    ];

    return (
        <div className={`flex-1 p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Setup Prompt
                    </h2>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Quản lý các prompt template cho AI tạo nội dung
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span className="font-medium">Thêm Prompt</span>
                </button>
            </div>

            {/* Prompt Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
            ) : prompts.length === 0 ? (
                <div className={`text-center py-12 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-card`}>
                    <Sparkles size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        Chưa có prompt nào. Hãy thêm prompt đầu tiên!
                    </p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {prompts.map((prompt) => (
                        <PromptCard
                            key={prompt.id}
                            prompt={prompt}
                            darkMode={darkMode}
                            promptTypes={promptTypes}
                            onEdit={() => setEditingPrompt(prompt)}
                            onDelete={() => handleDelete(prompt.id)}
                        />
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <PromptModal
                    darkMode={darkMode}
                    promptTypes={promptTypes}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAdd}
                />
            )}

            {/* Edit Modal */}
            {editingPrompt && (
                <PromptModal
                    darkMode={darkMode}
                    prompt={editingPrompt}
                    promptTypes={promptTypes}
                    onClose={() => setEditingPrompt(null)}
                    onSubmit={(data) => handleUpdate(editingPrompt.id, data)}
                />
            )}
        </div>
    );
};

// Prompt Card Component
const PromptCard = ({ prompt, darkMode, promptTypes, onEdit, onDelete }) => {
    const [copied, setCopied] = useState(false);
    const typeInfo = promptTypes.find(t => t.value === prompt.type) || promptTypes[0];

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.template);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`rounded-xl p-5 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-card hover:shadow-card-hover transition-shadow`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium text-white ${typeInfo.color}`}>
                        {typeInfo.label}
                    </span>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {prompt.name}
                    </h3>
                    {prompt.is_active ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Active</span>
                    ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">Inactive</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleCopy}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                        title="Copy template"
                    >
                        {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                    <button
                        onClick={onEdit}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                        title="Sửa"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={onDelete}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-600'
                            }`}
                        title="Xóa"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Template Preview */}
            <div className={`p-4 rounded-lg font-mono text-sm whitespace-pre-wrap ${darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-700'
                }`}>
                {prompt.template}
            </div>

            {/* Variables hint */}
            <div className={`mt-3 flex items-center gap-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <span>Biến có thể dùng:</span>
                <code className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>{'{{product}}'}</code>
                <code className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>{'{{style}}'}</code>
                <code className={`px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>{'{{person}}'}</code>
            </div>
        </div>
    );
};

// Prompt Modal Component
const PromptModal = ({ darkMode, prompt, promptTypes, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: prompt?.name || '',
        template: prompt?.template || `Hãy viết một comment tiếng Việt tự nhiên cho bài đăng về {{product}}.

Phong cách: {{style}}

Yêu cầu:
- Sử dụng emoji phù hợp
- Ngắn gọn, tự nhiên như người thật
- Giọng văn trẻ trung, thân thiện`,
        type: prompt?.type || 'comment',
        is_active: prompt?.is_active ?? 1,
    });

    const handleSubmit = () => {
        if (!formData.name.trim() || !formData.template.trim()) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {prompt ? 'Sửa Prompt' : 'Thêm Prompt Mới'}
                    </h3>
                    <button onClick={onClose} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Tên Prompt
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="VD: Comment khen ngợi sản phẩm"
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Loại
                        </label>
                        <div className="flex gap-2">
                            {promptTypes.map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setFormData({ ...formData, type: type.value })}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.type === type.value
                                            ? `${type.color} text-white shadow-md`
                                            : darkMode
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Template */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Template
                        </label>
                        <textarea
                            value={formData.template}
                            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                            rows={10}
                            className={`w-full px-3 py-2 rounded-lg border font-mono text-sm resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                }`}
                            placeholder="Nhập prompt template..."
                        />
                        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Sử dụng {'{{variable}}'} để chèn biến. VD: {'{{product}}'}, {'{{style}}'}, {'{{person}}'}
                        </p>
                    </div>

                    {/* Active */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active === 1}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                            className="w-4 h-4 rounded border-gray-300"
                        />
                        <label htmlFor="is_active" className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Kích hoạt prompt này
                        </label>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                    >
                        <Save size={16} />
                        {prompt ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupPrompt;
