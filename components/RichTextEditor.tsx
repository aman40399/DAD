'use client'

import { useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import 'react-quill/dist/quill.snow.css'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), [])

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ]

  return (
    <div className="rich-text-editor">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write your article content here...'}
        className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-white"
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 400px;
          font-size: 16px;
          font-family: inherit;
        }
        .rich-text-editor .ql-editor {
          min-height: 400px;
        }
        .rich-text-editor .ql-toolbar {
          background: white;
          border: 1px solid #d4d4d8;
          border-radius: 0.125rem 0.125rem 0 0;
        }
        .dark .rich-text-editor .ql-toolbar {
          background: #262626;
          border-color: #525252;
        }
        .rich-text-editor .ql-container {
          border: 1px solid #d4d4d8;
          border-radius: 0 0 0.125rem 0.125rem;
        }
        .dark .rich-text-editor .ql-container {
          border-color: #525252;
          background: #171717;
        }
        .dark .rich-text-editor .ql-editor {
          color: white;
        }
        .dark .rich-text-editor .ql-editor.ql-blank::before {
          color: #a3a3a3;
        }
        .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #525252;
        }
        .dark .rich-text-editor .ql-toolbar .ql-stroke {
          stroke: #a3a3a3;
        }
        .rich-text-editor .ql-toolbar .ql-fill {
          fill: #525252;
        }
        .dark .rich-text-editor .ql-toolbar .ql-fill {
          fill: #a3a3a3;
        }
        .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #525252;
        }
        .dark .rich-text-editor .ql-toolbar .ql-picker-label {
          color: #a3a3a3;
        }
      `}</style>
    </div>
  )
}
