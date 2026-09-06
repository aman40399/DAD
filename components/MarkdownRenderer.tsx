'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Headings
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl md:text-5xl font-black font-playfair mb-6 mt-8 text-neutral-900 dark:text-white leading-tight" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl md:text-4xl font-black font-playfair mb-5 mt-8 text-neutral-900 dark:text-white leading-tight" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl md:text-3xl font-bold font-playfair mb-4 mt-6 text-neutral-900 dark:text-white" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl md:text-2xl font-bold font-body mb-3 mt-5 text-neutral-900 dark:text-white" {...props} />
          ),
          h5: ({ node, ...props }) => (
            <h5 className="text-lg md:text-xl font-bold font-body mb-3 mt-4 text-neutral-900 dark:text-white" {...props} />
          ),
          h6: ({ node, ...props }) => (
            <h6 className="text-base md:text-lg font-bold font-body mb-2 mt-4 text-neutral-900 dark:text-white" {...props} />
          ),
          
          // Paragraphs
          p: ({ node, ...props }) => (
            <p className="text-neutral-800 dark:text-neutral-200 text-base md:text-lg leading-relaxed mb-6 font-body" {...props} />
          ),
          
          // Lists
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-neutral-800 dark:text-neutral-200" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-neutral-800 dark:text-neutral-200" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-base md:text-lg leading-relaxed font-body pl-2" {...props} />
          ),
          
          // Links
          a: ({ node, ...props }) => (
            <a 
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props} 
            />
          ),
          
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-600 pl-6 pr-4 py-4 my-6 bg-neutral-50 dark:bg-neutral-800 italic text-neutral-700 dark:text-neutral-300 text-lg" {...props} />
          ),
          
          // Code
          code: ({ node, inline, ...props }: any) => 
            inline ? (
              <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props} />
            ) : (
              <code className="block bg-neutral-900 dark:bg-neutral-950 p-4 rounded-lg overflow-x-auto text-sm font-mono text-neutral-100 my-6" {...props} />
            ),
          
          pre: ({ node, ...props }) => (
            <pre className="bg-neutral-900 dark:bg-neutral-950 p-4 rounded-lg overflow-x-auto my-6" {...props} />
          ),
          
          // Horizontal Rule
          hr: ({ node, ...props }) => (
            <hr className="border-t-2 border-neutral-300 dark:border-neutral-700 my-8" {...props} />
          ),
          
          // Images
          img: ({ node, ...props }) => (
            <img 
              className="rounded-lg my-6 w-full h-auto" 
              loading="lazy"
              {...props} 
            />
          ),
          
          // Tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-neutral-300 dark:border-neutral-700" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 px-4 py-2 text-left font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-neutral-300 dark:border-neutral-700 px-4 py-2" {...props} />
          ),
          
          // Strong/Bold
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-neutral-900 dark:text-white" {...props} />
          ),
          
          // Emphasis/Italic
          em: ({ node, ...props }) => (
            <em className="italic text-neutral-800 dark:text-neutral-200" {...props} />
          ),
          
          // Strikethrough
          del: ({ node, ...props }) => (
            <del className="line-through text-neutral-600 dark:text-neutral-400" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
