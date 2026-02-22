export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: number;
    category: string;
    coverGradient: string;
    locale: string;
    content: string;
}

export type BlogCategory = "tutorial" | "guide" | "tips";
