import React, { useRef } from 'react';
import { AspectRatio, OperationMode } from '../types';
import { ASPECT_RATIOS } from '../constants';
import { UploadIcon, SparklesIcon } from './Icons';

interface ControlPanelProps {
    mode: OperationMode;
    setMode: (mode: OperationMode) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    aspectRatio: AspectRatio;
    setAspectRatio: (ratio: AspectRatio) => void;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerate: () => void;
    onTransform: () => void;
    onEnhance: () => void;
    onChangeApiKey: () => void;
    isLoading: boolean;
    imageLoaded: boolean;
    fileName: string | null;
    customWidth: string;
    setCustomWidth: (width: string) => void;
    customHeight: string;
    setCustomHeight: (height: string) => void;
    isApiReady: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    mode, setMode, prompt, setPrompt, aspectRatio, setAspectRatio,
    onFileChange, onGenerate, onTransform, onEnhance, onChangeApiKey, isLoading, imageLoaded, fileName,
    customWidth, setCustomWidth, customHeight, setCustomHeight, isApiReady
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isGenerateDisabled = !prompt || isLoading || !isApiReady;
    const isCustomInvalid = aspectRatio === 'custom' && (!customWidth || !customHeight || Number(customWidth) <= 0 || Number(customHeight) <= 0);
    const isTransformDisabled = !imageLoaded || isLoading || isCustomInvalid || !isApiReady;
    const isEnhanceDisabled = !imageLoaded || isLoading || !isApiReady;

    return (
        <div className={`bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col space-y-6 w-full max-w-md`}>
            {/* Mode Selector */}
            <div>
                <div className="flex bg-gray-900 rounded-lg p-1">
                    <button
                        onClick={() => setMode('generate')}
                        disabled={isLoading || !isApiReady}
                        className={`w-full py-2.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${mode === 'generate' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        Создать новое
                    </button>
                    <button
                        onClick={() => setMode('transform')}
                        disabled={isLoading || !isApiReady}
                        className={`w-full py-2.5 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${mode === 'transform' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'} disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                        Редактировать
                    </button>
                </div>
            </div>

            {/* Prompt Input */}
            {mode === 'generate' && (
                <div className="flex flex-col space-y-2">
                    <label htmlFor="prompt" className="text-sm font-medium text-gray-300">Ваш запрос</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Например, 'Робот держит красный скейтборд'"
                        className="bg-gray-900 border border-gray-700 text-white rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition h-28 resize-none disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading || !isApiReady}
                    />
                </div>
            )}
            
            {/* File Upload */}
            {mode === 'transform' && (
                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-gray-300">Исходное изображение</label>
                    <input type="file" accept="image/*" onChange={onFileChange} ref={fileInputRef} className="hidden" />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || !isApiReady}
                        className="flex items-center justify-center w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <UploadIcon className="w-5 h-5 mr-2" />
                        {fileName ? `Файл: ${fileName}` : 'Загрузить изображение'}
                    </button>
                </div>
            )}

            {/* Aspect Ratio */}
            <div className="flex flex-col space-y-3">
                <label className="text-sm font-medium text-gray-300">Соотношение сторон</label>
                <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map(ratio => {
                         const isCustomButton = ratio === 'custom';
                         const isCustomDisabled = isCustomButton && mode === 'generate';
                         return (
                            <button
                                key={ratio}
                                onClick={() => setAspectRatio(ratio)}
                                disabled={isCustomDisabled || isLoading || !isApiReady}
                                title={isCustomDisabled ? "Произвольный формат доступен только в режиме редактирования" : undefined}
                                className={`py-2 text-sm font-mono rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'} ${isCustomDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'} disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {isCustomButton ? 'Свой' : ratio}
                            </button>
                         )
                    })}
                </div>
                 {aspectRatio === 'custom' && mode === 'transform' && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                             <label htmlFor="width" className="text-xs text-gray-400">Ширина (px)</label>
                             <input
                                id="width"
                                type="number"
                                value={customWidth}
                                onChange={(e) => setCustomWidth(e.target.value)}
                                placeholder="1024"
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isLoading || !isApiReady}
                            />
                        </div>
                        <div>
                             <label htmlFor="height" className="text-xs text-gray-400">Высота (px)</label>
                             <input
                                id="height"
                                type="number"
                                value={customHeight}
                                onChange={(e) => setCustomHeight(e.target.value)}
                                placeholder="768"
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={isLoading || !isApiReady}
                            />
                        </div>
                    </div>
                )}
            </div>
            
            {/* Action Buttons */}
            <div className="border-t border-gray-700 pt-6 space-y-4">
                {mode === 'generate' && (
                    <button
                        onClick={onGenerate}
                        disabled={isGenerateDisabled}
                        className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                    >
                        Создать
                    </button>
                )}
                {mode === 'transform' && (
                     <button
                        onClick={onTransform}
                        disabled={isTransformDisabled}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                    >
                        Преобразовать
                    </button>
                )}
                 <button
                    onClick={onEnhance}
                    disabled={isEnhanceDisabled}
                    className="flex items-center justify-center w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700"
                >
                    <SparklesIcon className="w-5 h-5 mr-2"/>
                    Улучшить качество
                </button>
                 <button
                    onClick={onChangeApiKey}
                    disabled={isLoading}
                    className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 text-sm"
                >
                    Сменить ключ API
                </button>
            </div>
        </div>
    );
};