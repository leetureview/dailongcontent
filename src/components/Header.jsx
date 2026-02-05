import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, Plus, X, FileSpreadsheet, AlertCircle, CheckCircle, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { commentsAPI, staffAPI } from '../api/client';
import { generatePostSuggestions, generateFullPost } from '../services/gemini';

const Header = ({ darkMode, onRefresh }) => {
    const [showImportModal, setShowImportModal] = useState(false);
    const [showAIPostModal, setShowAIPostModal] = useState(false);

    return (
        <>
            <header className={`h-16 px-6 flex items-center justify-between border-b ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${darkMode
                            ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}>
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium">Quay lại</span>
                    </button>

                    <div className={`h-6 w-px ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`} />

                    <div>
                        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            mắt kính anna
                        </h2>
                    </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowImportModal(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${darkMode
                                ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Upload size={16} />
                        <span className="text-sm font-medium">Import</span>
                    </button>

                    {/* AI Post Button */}
                    <button
                        onClick={() => setShowAIPostModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
                    >
                        <Sparkles size={16} />
                        <span className="text-sm font-medium">AI Tạo Post</span>
                    </button>
                </div>
            </header>

            {/* Import Modal */}
            {showImportModal && (
                <ImportModal
                    darkMode={darkMode}
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => {
                        setShowImportModal(false);
                        onRefresh?.();
                    }}
                />
            )}

            {/* AI Post Modal */}
            {showAIPostModal && (
                <AIPostModal
                    darkMode={darkMode}
                    onClose={() => setShowAIPostModal(false)}
                    onSuccess={() => {
                        setShowAIPostModal(false);
                        onRefresh?.();
                    }}
                />
            )}
        </>
    );
};

// AI Post Creation Modal
const AIPostModal = ({ darkMode, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: input topic, 2: show suggestions, 3: edit final
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState('');
    const [product, setProduct] = useState('mắt kính Anna');
    const [style, setStyle] = useState('trẻ trung, năng động');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [finalPost, setFinalPost] = useState({ content: '', hashtags: [] });
    const [copied, setCopied] = useState(false);

    const getApiKey = () => localStorage.getItem('gemini_api_key') || '';

    // Step 1: Generate suggestions based on topic
    const handleGenerateSuggestions = async () => {
        const apiKey = getApiKey();
        if (!apiKey) {
            alert('Vui lòng cấu hình API Key trong Settings trước!');
            return;
        }
        if (!topic.trim()) {
            alert('Vui lòng nhập chủ đề!');
            return;
        }

        setLoading(true);
        try {
            const results = await generatePostSuggestions(apiKey, topic, product, style, 3);
            setSuggestions(results);
            setStep(2);
        } catch (error) {
            alert('Lỗi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Select a suggestion and generate full post
    const handleSelectSuggestion = async (suggestion) => {
        setSelectedSuggestion(suggestion);
        setLoading(true);
        try {
            const apiKey = getApiKey();
            const result = await generateFullPost(apiKey, suggestion.title, topic, product);
            setFinalPost(result);
            setStep(3);
        } catch (error) {
            // Fallback to suggestion content
            setFinalPost({ content: suggestion.content, hashtags: suggestion.hashtags });
            setStep(3);
        } finally {
            setLoading(false);
        }
    };

    // Copy to clipboard
    const handleCopy = () => {
        const fullContent = `${finalPost.content}\n\n${finalPost.hashtags?.join(' ') || ''}`;
        navigator.clipboard.writeText(fullContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Save as comment
    const handleSaveAsComment = async () => {
        try {
            const staffRes = await staffAPI.getAll();
            const staff = staffRes.data?.[0];

            await commentsAPI.create({
                project_id: 1,
                staff_id: staff?.id || 1,
                content: finalPost.content,
                type: 'Bài đăng',
                condition: 'Đạt'
            });
            onSuccess?.();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden max-h-[90vh] flex flex-col`}>
                {/* Header */}
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-purple-500" size={20} />
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            AI Tạo Post
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            Bước {step}/3
                        </span>
                    </div>
                    <button onClick={onClose} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Step 1: Input topic */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    🎯 Chủ đề bài đăng
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="VD: Khuyến mãi mùa hè, Ra mắt sản phẩm mới, Tips chọn kính..."
                                    className={`w-full px-4 py-3 rounded-lg border text-lg ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Sản phẩm/Thương hiệu
                                    </label>
                                    <input
                                        type="text"
                                        value={product}
                                        onChange={(e) => setProduct(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                    />
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        Phong cách
                                    </label>
                                    <select
                                        value={style}
                                        onChange={(e) => setStyle(e.target.value)}
                                        className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                            }`}
                                    >
                                        <option value="trẻ trung, năng động">Trẻ trung, năng động</option>
                                        <option value="chuyên nghiệp, lịch sự">Chuyên nghiệp, lịch sự</option>
                                        <option value="hài hước, vui vẻ">Hài hước, vui vẻ</option>
                                        <option value="sang trọng, cao cấp">Sang trọng, cao cấp</option>
                                    </select>
                                </div>
                            </div>

                            {/* Topic suggestions */}
                            <div>
                                <p className={`text-xs mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Gợi ý chủ đề:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['Khuyến mãi cuối tuần', 'Sản phẩm hot', 'Tips thời trang', 'Review khách hàng', 'Xu hướng mới'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTopic(t)}
                                            className={`px-3 py-1 rounded-full text-xs transition-colors ${darkMode
                                                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Show suggestions */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Chọn 1 gợi ý để AI viết bài hoàn chỉnh:
                            </p>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelectSuggestion(suggestion)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${darkMode
                                            ? 'border-gray-700 hover:border-purple-500 bg-gray-750'
                                            : 'border-gray-200 hover:border-purple-500 bg-gray-50 hover:bg-purple-50'
                                        }`}
                                >
                                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        {suggestion.title}
                                    </h4>
                                    <p className={`text-sm mb-2 line-clamp-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {suggestion.content}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {suggestion.hashtags?.map((tag, i) => (
                                            <span key={i} className="text-xs text-purple-500">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => setStep(1)}
                                className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ← Quay lại nhập chủ đề khác
                            </button>
                        </div>
                    )}

                    {/* Step 3: Edit final post */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    ✨ Nội dung bài đăng
                                </label>
                                <textarea
                                    value={finalPost.content}
                                    onChange={(e) => setFinalPost({ ...finalPost, content: e.target.value })}
                                    rows={8}
                                    className={`w-full px-4 py-3 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    #️⃣ Hashtags
                                </label>
                                <input
                                    type="text"
                                    value={finalPost.hashtags?.join(' ') || ''}
                                    onChange={(e) => setFinalPost({ ...finalPost, hashtags: e.target.value.split(' ').filter(t => t) })}
                                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                ← Chọn gợi ý khác
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex justify-between`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        Đóng
                    </button>

                    <div className="flex gap-2">
                        {step === 1 && (
                            <button
                                onClick={handleGenerateSuggestions}
                                disabled={loading || !topic.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-lg"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                Tạo gợi ý
                            </button>
                        )}

                        {step === 2 && loading && (
                            <div className="flex items-center gap-2 px-4 py-2 text-purple-500">
                                <Loader2 size={16} className="animate-spin" />
                                Đang viết bài...
                            </div>
                        )}

                        {step === 3 && (
                            <>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                    {copied ? 'Đã copy!' : 'Copy'}
                                </button>
                                <button
                                    onClick={handleSaveAsComment}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                                >
                                    <Plus size={16} />
                                    Lưu vào bảng
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Import Modal Component
const ImportModal = ({ darkMode, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').slice(0, 6);
                setPreview(lines.map(line => line.split(',')));
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const text = await file.text();
            const lines = text.split('\n').slice(1);

            const staffRes = await staffAPI.getAll();
            const staffList = staffRes.data;

            const comments = lines
                .filter(line => line.trim())
                .map(line => {
                    const cols = line.split(',');
                    const staffName = cols[1]?.trim();
                    const staff = staffList.find(s => s.name === staffName) || staffList[0];
                    return {
                        project_id: 1,
                        staff_id: staff?.id || 1,
                        content: cols[2]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
                        type: cols[3]?.trim() || 'Khen ngợi',
                        condition: cols[4]?.trim() || 'Đạt'
                    };
                });

            const result = await commentsAPI.createBulk(comments);
            setResult({ success: true, count: result.data.insertedIds.length });

            setTimeout(() => onSuccess?.(), 1500);
        } catch (error) {
            setResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`w-full max-w-2xl rounded-xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Import Comments từ CSV
                    </h3>
                    <button onClick={onClose} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <X size={20} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                </div>

                <div className={`border-2 border-dashed rounded-lg p-8 text-center ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload" />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                        <FileSpreadsheet size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {file ? file.name : 'Click để chọn file CSV'}
                        </p>
                    </label>
                </div>

                {preview.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                        <table className={`w-full text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr key={i} className={i === 0 ? 'font-bold' : ''}>
                                        {row.map((cell, j) => (
                                            <td key={j} className="px-2 py-1 border border-gray-600 truncate max-w-[150px]">{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {result && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {result.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span>{result.success ? `Import thành công ${result.count} comments!` : `Lỗi: ${result.error}`}</span>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className={`px-4 py-2 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                        Đóng
                    </button>
                    <button onClick={handleImport} disabled={!file || loading} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg flex items-center gap-2">
                        {loading && <Loader2 size={16} className="animate-spin" />}
                        Import
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
