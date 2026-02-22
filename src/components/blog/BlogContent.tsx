import { MDXRemote } from "next-mdx-remote/rsc";

interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    return (
        <div className="prose prose-invert prose-lg max-w-none
            prose-headings:text-text-primary prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border-default prose-h2:pb-2
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-text-secondary prose-p:leading-relaxed prose-p:mb-4
            prose-strong:text-text-primary prose-strong:font-semibold
            prose-ul:text-text-secondary prose-ul:space-y-1
            prose-li:text-text-secondary prose-li:marker:text-accent
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-code:text-accent prose-code:bg-bg-tertiary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-blockquote:border-accent prose-blockquote:text-text-secondary
        ">
            <MDXRemote source={content} />
        </div>
    );
}
