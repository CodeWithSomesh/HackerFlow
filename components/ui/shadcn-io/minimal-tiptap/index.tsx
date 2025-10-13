'use client';

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toggle } from '@/components/ui/toggle'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  Underline as UnderlineIcon,
  Type,
} from 'lucide-react';
import Underline from '@tiptap/extension-underline';
import { cn } from "@/lib/utils";

interface MinimalTiptapProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

function MinimalTiptap({
  content = '',
  onChange,
  placeholder = 'Start typing...',
  editable = true,
  className,
}: MinimalTiptapProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
    ],
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-invert max-w-none focus:outline-none',
          'min-h-[400px] p-6',
          // Custom prose styles for dark theme
          '[&_h1]:text-4xl [&_h1]:font-bold [&_h1]:text-gray-100 [&_h1]:mb-4 [&_h1]:mt-6',
          '[&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-gray-100 [&_h2]:mb-3 [&_h2]:mt-5',
          '[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-100 [&_h3]:mb-2 [&_h3]:mt-4',
          '[&_p]:text-gray-300 [&_p]:leading-7 [&_p]:mb-4',
          '[&_strong]:text-gray-100 [&_strong]:font-semibold',
          '[&_em]:text-gray-200',
          '[&_u]:text-gray-200 [&_u]:decoration-teal-400',
          '[&_code]:text-teal-400 [&_code]:bg-gray-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-l-teal-500 [&_blockquote]:bg-gray-800/40 [&_blockquote]:py-2 [&_blockquote]:px-4 [&_blockquote]:text-gray-300 [&_blockquote]:my-4',
          '[&_ul]:text-gray-300 [&_ul]:my-4 [&_ul]:ml-6 [&_ul]:list-disc',
          '[&_ol]:text-gray-300 [&_ol]:my-4 [&_ol]:ml-6 [&_ol]:list-decimal',
          '[&_li]:my-1 [&_li]:text-gray-300',
          '[&_li::marker]:text-teal-400',
          '[&_hr]:border-gray-700 [&_hr]:my-6'
        ),
      },
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border border-gray-700 rounded-lg overflow-hidden bg-black', className)}>
      {/* Toolbar */}
      <div className="border-b border-gray-700 bg-gray-900/60 p-2 flex flex-wrap items-center gap-1 backdrop-blur-sm">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Code className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 bg-gray-700" />

        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('paragraph')}
          onPressedChange={() => editor.chain().focus().setParagraph().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Type className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 bg-gray-700" />

        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <List className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          className="data-[state=on]:bg-teal-500/20 data-[state=on]:text-teal-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 bg-gray-700" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="hover:bg-gray-800 hover:text-gray-200"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 bg-gray-700" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="hover:bg-gray-800 hover:text-gray-200 disabled:opacity-30"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="hover:bg-gray-800 hover:text-gray-200 disabled:opacity-30"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor Content */}
      <div className="">
        <EditorContent 
          editor={editor} 
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export { MinimalTiptap, type MinimalTiptapProps };