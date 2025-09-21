import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { AspectRatio } from '../types';

let ai: GoogleGenAI | null = null;

export const initializeApi = (apiKey: string): boolean => {
    if (!apiKey) {
        console.error("Attempted to initialize API with an empty key.");
        ai = null;
        return false;
    }
    try {
        ai = new GoogleGenAI({ apiKey });
        return true;
    } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        ai = null;
        return false;
    }
};

export const deinitializeApi = () => {
    ai = null;
};

export const isApiConfigured = (): boolean => {
    return ai !== null;
};

const ensureApiInitialized = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("AI клиент не был инициализирован. Пожалуйста, введите ключ API.");
    }
    return ai;
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const generateImage = async (prompt: string, aspectRatio: Exclude<AspectRatio, 'custom'>): Promise<string> => {
    const localAi = ensureApiInitialized();
    const response = await localAi.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: aspectRatio,
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("Image generation failed, no images returned.");
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

const processImageEditingResponse = (response: GenerateContentResponse): string => {
    if (!response.candidates || response.candidates.length === 0) {
        throw new Error("Image processing failed: no candidates returned.");
    }

    const imagePart = response.candidates[0].content.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
        const base64ImageBytes: string = imagePart.inlineData.data;
        return `data:${imagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
    }

    throw new Error("Image processing failed: no image data found in response.");
}

export const transformImage = async (imageBase64: string, mimeType: string, targetFormat: string): Promise<string> => {
    const localAi = ensureApiInitialized();
    const imagePart = {
        inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: mimeType,
        },
    };

    const promptText = targetFormat.includes(':')
        ? `Extend this image to fit a ${targetFormat} aspect ratio.`
        : `Extend this image to a resolution of ${targetFormat.replace('x', ' by ')} pixels.`;

    const textPart = {
        text: `${promptText} Do not stretch the original content. Intelligently fill in the new areas to match the existing style and content of the image, creating a seamless, larger picture.`,
    };

    const response = await localAi.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    return processImageEditingResponse(response);
};

export const enhanceImage = async (imageBase64: string, mimeType: string): Promise<string> => {
    const localAi = ensureApiInitialized();
    const imagePart = {
        inlineData: {
            data: imageBase64.split(',')[1],
            mimeType: mimeType,
        },
    };

    const textPart = {
        text: "Enhance the quality of this image. Increase its resolution, sharpness, and detail without altering the content. Correct any artifacts, noise, or blurriness to make it look photorealistic and high-definition.",
    };

    const response = await localAi.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    return processImageEditingResponse(response);
};