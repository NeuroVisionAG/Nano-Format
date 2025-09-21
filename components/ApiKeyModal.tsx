import React, { useState } from 'react';

interface ApiKeyModalProps {
    onSave: (apiKey: string) => void;
    initialError: string | null;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, initialError }) => {
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState<string | null>(initialError);

    const handleSaveClick = () => {
        if (!apiKey.trim()) {
            setError("Ключ API не может быть пустым.");
            return;
        }
        setError(null);
        onSave(apiKey);
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 font-sans">
            <div className="bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-4">Требуется ключ API</h2>
                <p className="text-gray-400 mb-6">
                    Пожалуйста, введите ваш ключ API от Google Gemini, чтобы продолжить. Ваш ключ будет сохранён локально в вашем браузере.
                </p>

                <div className="flex flex-col space-y-2">
                    <label htmlFor="apiKey" className="text-sm font-medium text-gray-300">
                        Ваш ключ API
                    </label>
                    <input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Введите ваш ключ здесь"
                        className="bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                </div>
                
                {(error || initialError) && (
                    <p className="text-red-400 text-sm mt-3">{error || initialError}</p>
                )}

                <button
                    onClick={handleSaveClick}
                    className="w-full mt-6 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                >
                    Сохранить и продолжить
                </button>
            </div>
        </div>
    );
};