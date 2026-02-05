import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, FileText, RefreshCcw, MoreHorizontal, CornerDownRight, Plus, Trash2, Edit2, X, Sparkles, Settings, Loader2 } from 'lucide-react';
import { commentsAPI, staffAPI, promptsAPI } from '../api/client';
import { generateComments } from '../services/gemini';
import Avatar from './Avatar';

const ResultTable = ({ darkMode, projectId = 1 }) => {
    const [comments, setComments] = useState([]);
    const [staff, setStaff] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingComment, setEditingComment] = useState(null);
    const [showAIModal, setShowAIModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [aiGenerating, setAIGenerating] = useState(false);

    // Get API key from localStorage
    const getApiKey = () => localStorage.getItem('gemini_api_key') || '';

    // Fetch comments
    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const response = await commentsAPI.getAll(projectId, searchTerm);
            setComments(response.data || []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [projectId, searchTerm]);

    // Fetch staff and prompts
    const fetchData = useCallback(async () => {
        try {
            const [staffRes, promptsRes] = await Promise.all([
                staffAPI.getAll(),
                promptsAPI.getAll(projectId)
            ]);
            setStaff(staffRes.data || []);
            setPrompts(promptsRes.data || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        }
    }, [projectId]);

    useEffect(() => {
        fetchComments();
        fetchData();
    }, [fetchComments, fetchData]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchComments();
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Export to CSV
    const handleExport = async () => {
        try {
            const response = await commentsAPI.export(projectId);
            const data = response.data;

            const headers = ['STT', 'Người', 'Nội dung', 'Loại', 'Điều kiện'];
            const rows = data.map((item, index) => [
                index + 1,
                item.person,
                `"${item.content.replace(/"/g, '""')}"`,
                item.type,
                item.condition
            ]);

            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `comments_export_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (err) {
            alert('Export failed: ' + err.message);
        }
    };

    // Delete comment
    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xóa comment này?')) return;

        try {
            await commentsAPI.delete(id);
            fetchComments();
        } catch (err) {
            alert('Delete failed: ' + err.message);
        }
    };

    // Add comment
    const handleAddComment = async (formData) => {
        try {
            await commentsAPI.create({
                project_id: projectId,
                staff_id: formData.staff_id,
                content: formData.content,
                type: formData.type,
                condition: 'Đạt'
            });
            setShowAddModal(false);
            fetchComments();
        } catch (err) {
            alert('Add failed: ' + err.message);
        }
    };

    // Update comment
    const handleUpdateComment = async (id, formData) => {
        try {
            await commentsAPI.update(id, formData);
            setEditingComment(null);
            fetchComments();
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    // AI Generate comments
    const handleAIGenerate = async (config) => {
        const apiKey = getApiKey();
        if (!apiKey) {
            alert('Vui lòng cấu hình API Key trước!');
            setShowSettingsModal(true);
            return;
        }

        setAIGenerating(true);
        try {
            // Get selected prompt template
            const prompt = prompts.find(p => p.id === config.promptId);
            if (!prompt) throw new Error('Prompt không tồn tại');

            // Generate comments using AI
            const generatedContents = await generateComments(
                apiKey,
                prompt.template,
                {
                    product: config.product || 'mắt kính Anna',
                    style: config.style || 'trẻ trung, năng động',
                    person: 'người dùng thật'
                },
                config.count
            );

            // Create comments in database
            const commentsToCreate = generatedContents.map((content, index) => ({
                project_id: projectId,
                staff_id: staff[index % staff.length]?.id || 1,
                content: content,
                type: config.type || 'Khen ngợi',
                condition: 'Đạt'
            }));

            await commentsAPI.createBulk(commentsToCreate);
            setShowAIModal(false);
            fetchComments();
            alert(`Đã tạo ${generatedContents.length} comments thành công!`);
        } catch (err) {
            alert('AI Generate failed: ' + err.message);
        } finally {
            setAIGenerating(false);
        }
    };

    return (
        <div className={`flex-1 flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-card m-4 overflow-hidden`}>
            {/* Table Header */}
            <div className={`px-5 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Kết quả
                        <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ({comments.length} comments)
                        </span>
                    </h3>

                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                            }`}>
                            <Search size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`bg-transparent text-sm outline-none w-32 ${darkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                                    }`}
                            />
                        </div>

                        {/* Settings button */}
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className={`p-2 rounded-lg border transition-colors ${darkMode
                                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            title="Cài đặt API"
                        >
                            <Settings size={18} />
                        </button>

                        {/* Export button */}
                        <button
                            onClick={handleExport}
                            className={`p-2 rounded-lg border transition-colors ${darkMode
                                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                            title="Export CSV"
                        >
                            <Download size={18} />
                        </button>

                        {/* Add button */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            <span className="text-sm font-medium">Thêm</span>
                        </button>

                        {/* AI Generate button */}
                        <button
                            onClick={() => setShowAIModal(true)}
                            disabled={aiGenerating}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                        >
                            {aiGenerating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Sparkles size={16} />
                            )}
                            <span className="text-sm font-medium">AI Tạo</span>
                        </button>

                        {/* Refresh button */}
                        <button
                            onClick={fetchComments}
                            className={`p-2 rounded-lg border transition-colors ${darkMode
                                    ? 'border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white'
                                    : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading / Error states */}
            {loading && comments.length === 0 && (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
                </div>
            )}

            {error && (
                <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* Table Content */}
            {!loading && !error && (
                <div className="flex-1 overflow-auto">
                    <table className="w-full">
                        <thead className={`sticky top-0 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <tr className={`text-left text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                <th className="px-5 py-3 w-16">STT</th>
                                <th className="px-5 py-3 w-36">Người</th>
                                <th className="px-5 py-3">Nội dung comment</th>
                                <th className="px-5 py-3 w-28">Loại</th>
                                <th className="px-5 py-3 w-24">Điều kiện</th>
                                <th className="px-5 py-3 w-24">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                            {comments.map((comment, index) => (
                                <tr key={comment.id} className={`table-row-hover`}>
                                    <td className={`px-5 py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Avatar
                                                name={comment.person?.name || 'Unknown'}
                                                color={comment.person?.color || '#6B7280'}
                                                size="sm"
                                            />
                                            <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                {comment.person?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div>
                                            {comment.replyTo && (
                                                <div className={`flex items-center gap-1.5 mb-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    <CornerDownRight size={12} />
                                                    <span>Trả lời</span>
                                                    <span className={`font-medium ${darkMode ? 'text-primary-400' : 'text-primary-600'}`}>
                                                        {comment.replyTo.name}
                                                    </span>
                                                </div>
                                            )}
                                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                {comment.content}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {comment.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${comment.condition === 'Đạt'
                                                ? 'bg-success-50 text-success-600'
                                                : 'bg-yellow-50 text-yellow-600'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${comment.condition === 'Đạt' ? 'bg-success-500' : 'bg-yellow-500'
                                                }`} />
                                            {comment.condition}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setEditingComment(comment)}
                                                className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-red-900/30 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-400 hover:text-red-600'
                                                    }`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {comments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Search size={24} className={darkMode ? 'text-gray-500 mb-2' : 'text-gray-400 mb-2'} />
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Không tìm thấy kết quả
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className={`px-5 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}`}>
                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    Hiển thị {comments.length} kết quả
                </span>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <CommentModal
                    darkMode={darkMode}
                    staff={staff}
                    onClose={() => setShowAddModal(false)}
                    onSubmit={handleAddComment}
                />
            )}

            {/* Edit Modal */}
            {editingComment && (
                <CommentModal
                    darkMode={darkMode}
                    staff={staff}
                    comment={editingComment}
                    onClose={() => setEditingComment(null)}
                    onSubmit={(data) => handleUpdateComment(editingComment.id, data)}
                />
            )}

            {/* AI Generate Modal */}
            {showAIModal && (
                <AIGenerateModal
                    darkMode={darkMode}
                    prompts={prompts}
                    onClose={() => setShowAIModal(false)}
                    onGenerate={handleAIGenerate}
                    loading={aiGenerating}
                />
            )}

            {/* Settings Modal */}
            {showSettingsModal && (
                <SettingsModal
                    darkMode={darkMode}
                    onClose={() => setShowSettingsModal(false)}
                />
            )}
        </div>
    );
};

// Comment Modal Component
const CommentModal = ({ darkMode, staff, comment, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        staff_id: comment?.person?.id || staff[0]?.id || 1,
        content: comment?.content || '',
        type: comment?.type || 'Khen ngợi',
    });

    const commentTypes = ['Khen ngợi', 'Hỏi địa chỉ', 'Hỏi thông tin', 'Hỏi giá'];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-lg rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {comment ? 'Sửa Comment' : 'Thêm Comment Mới'}
                    </h3>
                    <button onClick={onClose} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                <div className="space-y-4">
                    {!comment && (
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Người</label>
                            <select
                                value={formData.staff_id}
                                onChange={(e) => setFormData({ ...formData, staff_id: parseInt(e.target.value) })}
                                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loại</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                            {commentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nội dung</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            rows={4}
                            className={`w-full px-3 py-2 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            placeholder="Nhập nội dung..."
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        Hủy
                    </button>
                    <button onClick={() => onSubmit(formData)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
                        {comment ? 'Cập nhật' : 'Thêm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// AI Generate Modal
const AIGenerateModal = ({ darkMode, prompts, onClose, onGenerate, loading }) => {
    const [config, setConfig] = useState({
        promptId: prompts[0]?.id || null,
        product: 'mắt kính Anna',
        style: 'trẻ trung, năng động',
        type: 'Khen ngợi',
        count: 5
    });

    const commentTypes = ['Khen ngợi', 'Hỏi địa chỉ', 'Hỏi thông tin', 'Hỏi giá'];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-lg rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-purple-500" size={20} />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            AI Tạo Comments
                        </h3>
                    </div>
                    <button onClick={onClose} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Prompt select */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Chọn Prompt Template
                        </label>
                        <select
                            value={config.promptId || ''}
                            onChange={(e) => setConfig({ ...config, promptId: parseInt(e.target.value) })}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                            {prompts.length === 0 ? (
                                <option value="">-- Chưa có prompt --</option>
                            ) : (
                                prompts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                            )}
                        </select>
                    </div>

                    {/* Product */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Sản phẩm
                        </label>
                        <input
                            type="text"
                            value={config.product}
                            onChange={(e) => setConfig({ ...config, product: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>

                    {/* Style */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Phong cách
                        </label>
                        <input
                            type="text"
                            value={config.style}
                            onChange={(e) => setConfig({ ...config, style: e.target.value })}
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Loại comment
                            </label>
                            <select
                                value={config.type}
                                onChange={(e) => setConfig({ ...config, type: e.target.value })}
                                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            >
                                {commentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        {/* Count */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Số lượng
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={config.count}
                                onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) || 1 })}
                                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        Hủy
                    </button>
                    <button
                        onClick={() => onGenerate(config)}
                        disabled={loading || !config.promptId}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-lg"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Tạo {config.count} comments
                    </button>
                </div>
            </div>
        </div>
    );
};

// Settings Modal
const SettingsModal = ({ darkMode, onClose }) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('gemini_api_key', apiKey);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-md rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Cài đặt API
                    </h3>
                    <button onClick={onClose} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Google Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Nhập API key..."
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                        <p className={`mt-1 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Lấy API key tại: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">aistudio.google.com/apikey</a>
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                    >
                        {saved ? '✓ Đã lưu!' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultTable;
