import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '@/types/activity.type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function validateImageFile(file: File): string | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return 'Please upload a valid image file (JPG, PNG, or WEBP).';
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
        return 'Image must be smaller than 5MB.';
    }
    return null;
}
const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|mkv|avi)(\/stream)?$/i;
export function resolveMediaUrl(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;

    if (url.startsWith('/api/media-proxy')) {
        const inner = new URL(url, 'http://localhost').searchParams.get('url');
        if (inner && !VIDEO_EXTENSIONS.test(inner)) return inner;
        return url;
    }

    if (url.startsWith('/')) return url;

    if (url.startsWith('http')) {
        return VIDEO_EXTENSIONS.test(url)
            ? `/api/media-proxy?url=${encodeURIComponent(`${url}/stream`)}`
            : url;
    }

    const fileName = url.replace(/^media\/(images|videos)\//, '');
    const isVideo = VIDEO_EXTENSIONS.test(fileName);
    const absolute = isVideo
        ? `${API_URL}media/videos/${fileName}/stream`
        : `${API_URL}media/images/${fileName}`;

    return isVideo
        ? `/api/media-proxy?url=${encodeURIComponent(absolute)}`
        : absolute;
}