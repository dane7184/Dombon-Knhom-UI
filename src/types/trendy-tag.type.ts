export interface TagData {
    tagId: string;
    name: string;
    usageCount: number;
}

export interface TrendingTagsResponse {
    success: boolean;
    message: string;
    data: TagData[];
}