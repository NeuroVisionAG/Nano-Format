import React from 'react';
import { AspectRatio } from '../types';
import { SpinnerIcon, DownloadIcon } from './Icons';

interface ImageDisplayProps {
    imageSrc: string | null;
    isLoading: boolean;
    loadingMessage: string;
    aspectRatio: AspectRatio;
    onDownload: () => void;
    customWidth?: number;
    customHeight?: number;
}

const aspectRatioClasses: { [key in Exclude<AspectRatio, 'custom'>]: string } = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
    '9:16': 'aspect-[9/16]',
};

export const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageSrc, isLoading, loadingMessage, aspectRatio, onDownload, customWidth, customHeight }) => {

    const getAspectRatioClass = () => {
        if (aspectRatio === 'custom') {
            // Use 1:1 as a fallback if custom dimensions are invalid
            if (!customWidth || !customHeight || customWidth <= 0 || customHeight <= 0) {
                return aspectRatioClasses['1:1'];
            }
            // For valid custom ratios, class is not needed as inline style is used
            return '';
        }
        return aspectRatioClasses[aspectRatio];
    };

    const style = (aspectRatio === 'custom' && customWidth && customHeight && customWidth > 0 && customHeight > 0)
        ? { aspectRatio: `${customWidth} / ${customHeight}` }
        : {};

    return (
        <div style={style} className={`relative w-full ${getAspectRatioClass()} bg-gray-800 rounded-xl shadow-lg flex items-center justify-center overflow-hidden transition-all duration-300`}>
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-60 z-10 flex flex-col items-center justify-center text-white p-4">
                    <SpinnerIcon className="w-16 h-16 mb-4" />
                    <p className="text-lg font-semibold text-center">{loadingMessage}</p>
                </div>
            )}

            {!isLoading && imageSrc && (
                <>
                    <img src={imageSrc} alt="Generated content" className="object-contain w-full h-full" />
                    <button
                        onClick={onDownload}
                        className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 z-20"
                        aria-label="Скачать изображение"
                    >
                        <DownloadIcon className="w-6 h-6" />
                    </button>
                </>
            )}

            {!isLoading && !imageSrc && (
                <div className="text-center text-gray-400">
                    <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium">Изображение появится здесь</h3>
                    <p className="mt-1 text-sm text-gray-500">Создайте новое или загрузите свое.</p>
                </div>
            )}
        </div>
    );
};