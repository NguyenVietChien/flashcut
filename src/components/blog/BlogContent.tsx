import { MDXRemote } from "next-mdx-remote/rsc";

interface BlogContentProps {
    content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
    return (
        <div className="prose prose-invert prose-lg max-w-none
            prose-headings:text-text-primary prose-headings:font-bold prose-headings:tracking-tight

            prose-h2:text-[1.5rem] prose-h2:mt-12 prose-h2:mb-5 prose-h2:pb-3
            prose-h2:border-b prose-h2:border-border-default

            prose-h3:text-[1.2rem] prose-h3:mt-8 prose-h3:mb-3

            prose-p:text-[#c0c0c0] prose-p:leading-[1.8] prose-p:mb-5 prose-p:text-[15.5px]

            prose-strong:text-white prose-strong:font-semibold

            prose-ul:text-[#c0c0c0] prose-ul:space-y-2 prose-ul:pl-6 prose-ul:my-4
            prose-ul:list-disc

            prose-ol:text-[#c0c0c0] prose-ol:space-y-2 prose-ol:pl-6 prose-ol:my-4
            prose-ol:list-decimal

            prose-li:text-[#c0c0c0] prose-li:text-[15.5px] prose-li:leading-[1.7]
            prose-li:marker:text-accent

            prose-a:text-accent prose-a:no-underline prose-a:font-medium
            hover:prose-a:underline

            prose-code:text-accent prose-code:bg-bg-tertiary
            prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
            prose-code:text-[13.5px] prose-code:font-normal

            prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border-default
            prose-pre:rounded-xl prose-pre:my-6

            prose-blockquote:border-l-accent prose-blockquote:border-l-2
            prose-blockquote:text-text-secondary prose-blockquote:italic
            prose-blockquote:pl-5 prose-blockquote:my-6

            prose-hr:border-border-default prose-hr:my-10

            prose-img:rounded-xl prose-img:my-6
        ">
            <MDXRemote source={content} />
        </div>
    );
}
