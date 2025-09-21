import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { AspectRatio, OperationMode } from './types';
import { ControlPanel } from './components/ControlPanel';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImage, transformImage, enhanceImage, initializeApi, deinitializeApi } from './services/geminiService';
import { ApiKeyModal } from './components/ApiKeyModal';

const API_KEY_STORAGE_KEY = 'gemini-api-key';

const App: React.FC = () => {
    const [mode, setMode] = useState<OperationMode>('generate');
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
    const [customWidth, setCustomWidth] = useState<string>('1024');
    const [customHeight, setCustomHeight] = useState<string>('768');
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [originalImageData, setOriginalImageData] = useState<{ base64: string; mimeType: string; } | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isApiReady, setIsApiReady] = useState<boolean>(false);

    useEffect(() => {
        const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
        if (savedKey) {
            if (initializeApi(savedKey)) {
                setIsApiReady(true);
            } else {
                // The saved key might be invalid
                localStorage.removeItem(API_KEY_STORAGE_KEY);
            }
        }
    }, []);

    const handleApiKeySave = (key: string) => {
        if (initializeApi(key)) {
            localStorage.setItem(API_KEY_STORAGE_KEY, key);
            setIsApiReady(true);
            setError(null);
        } else {
            setError("Не удалось инициализировать API с предоставленным ключом. Пожалуйста, проверьте ключ и попробуйте снова.");
            setIsApiReady(false);
        }
    };

    const handleChangeApiKey = () => {
        deinitializeApi();
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        setIsApiReady(false);
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setIsLoading(true);
            setLoadingMessage('Обработка файла...');
            setError(null);
            setUploadedFileName(file.name);

            try {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result as string;
                    setImageSrc(base64);
                    setOriginalImageData({ base64, mimeType: file.type });
                    setIsLoading(false);
                };
                reader.onerror = () => {
                    setError('Не удалось прочитать файл.');
                    setIsLoading(false);
                }
                reader.readAsDataURL(file);
            } catch (e) {
                setError('Произошла ошибка при обработке файла.');
                setIsLoading(false);
            }
        }
    };

    const handleApiCall = useCallback(async (apiFunc: () => Promise<string>, loadingMsg: string) => {
        if (!isApiReady) {
            setError("Ключ API не настроен. Запросы не могут быть выполнены.");
            return;
        }
        setIsLoading(true);
        setLoadingMessage(loadingMsg);
        setError(null);
        try {
            const resultBase64 = await apiFunc();
            setImageSrc(resultBase64);
            setOriginalImageData({ base64: resultBase64, mimeType: 'image/png' }); // Assume API returns PNG
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Произошла неизвестная ошибка.');
        } finally {
            setIsLoading(false);
        }
    }, [isApiReady]);

    const handleGenerate = useCallback(() => {
        if (!prompt || aspectRatio === 'custom') return;
        handleApiCall(() => generateImage(prompt, aspectRatio), 'Создание изображения...');
    }, [prompt, aspectRatio, handleApiCall]);

    const handleTransform = useCallback(() => {
        if (!originalImageData) return;
        const { base64, mimeType } = originalImageData;
        const targetFormat = aspectRatio === 'custom'
            ? `${customWidth}x${customHeight}`
            : aspectRatio;

        handleApiCall(() => transformImage(base64, mimeType, targetFormat), 'Преобразование изображения...');
    }, [originalImageData, aspectRatio, customWidth, customHeight, handleApiCall]);

    const handleEnhance = useCallback(() => {
        if (!imageSrc) return;
        // The current displayed image might be a transformed one. Use its data.
        const mimeType = imageSrc.substring(imageSrc.indexOf(':') + 1, imageSrc.indexOf(';'));
        handleApiCall(() => enhanceImage(imageSrc, mimeType), 'Улучшение качества...');
    }, [imageSrc, handleApiCall]);

    const handleDownload = useCallback(() => {
        if (!imageSrc) return;
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = `ai-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [imageSrc]);
    
    // Switch back to a valid aspect ratio if user switches to generate mode with 'custom' selected
    useEffect(() => {
        if (mode === 'generate' && aspectRatio === 'custom') {
            setAspectRatio('1:1');
        }
    }, [mode, aspectRatio]);


    if (!isApiReady) {
        return <ApiKeyModal onSave={handleApiKeySave} initialError={error} />;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <header className="py-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
                <h1 className="text-center text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">AI Image Studio</h1>
            </header>
            
            <main className="container mx-auto p-4 md:p-8">
                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Ошибка: </strong>
                        <span className="block sm:inline">{error}</span>
                        <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                            <svg className="fill-current h-6 w-6 text-red-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                        </span>
                    </div>
                )}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/3">
                        <ControlPanel
                            mode={mode}
                            setMode={setMode}
                            prompt={prompt}
                            setPrompt={setPrompt}
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                            onFileChange={handleFileChange}
                            onGenerate={handleGenerate}
                            onTransform={handleTransform}
                            onEnhance={handleEnhance}
                            onChangeApiKey={handleChangeApiKey}
                            isLoading={isLoading}
                            imageLoaded={!!imageSrc}
                            fileName={uploadedFileName}
                            customWidth={customWidth}
                            setCustomWidth={setCustomWidth}
                            customHeight={customHeight}
                            setCustomHeight={setCustomHeight}
                            isApiReady={isApiReady}
                        />
                    </div>
                    <div className="lg:w-2/3">
                         <ImageDisplay
                            imageSrc={imageSrc}
                            isLoading={isLoading}
                            loadingMessage={loadingMessage}
                            aspectRatio={aspectRatio}
                            onDownload={handleDownload}
                            customWidth={Number(customWidth)}
                            customHeight={Number(customHeight)}
                        />
                    </div>
                </div>
            </main>
             <footer className="text-center py-4 mt-8 text-gray-500 text-sm">
                <p>Создано с помощью Google Gemini API</p>
            </footer>
        </div>
    );
};

export default App;