'use client';

import {
  EditorContent,
  useEditor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useEffect, useState } from 'react';
import {
  Bold, Italic, Strikethrough, Code, ListOrdered, List,
  Heading1, Heading2, Quote, Redo, Undo
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorProps {
  initialContent?: string;
  onContentChange?: (html: string) => void;
}

export default function Editor({ initialContent = '', onContentChange }: EditorProps) {
  const [isClient, setIsClient] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Comece a escrever a descrição aqui...',
      }),
    ],
    content: initialContent,
    autofocus: true,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'focus:outline-none px-4 py-2 min-h-[200px] bg-background text-text placeholder:text-muted-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onContentChange) onContentChange(html);
    }
  });

  // Update content if initialContent changes (for editing)
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  useEffect(() => setIsClient(true), []);

  const toggle = useCallback((action: string, params?: unknown) => {
    if (editor) {
      const chain = editor.chain().focus();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (chain as any)[action](params).run();
    }
  }, [editor]);

  if (!isClient || !editor) return <p className="text-sm text-muted-foreground">Carregando editor...</p>;

  return (
    <div className="relative w-full border rounded-2xl shadow-md bg-background p-4">
      <div className="flex gap-1 bg-muted p-1 rounded-md shadow-sm mb-2">
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleBold')} aria-label="Negrito">
          <Bold className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleItalic')} aria-label="Itálico">
          <Italic className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleStrike')} aria-label="Riscado">
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleCode')} aria-label="Código">
          <Code className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('setParagraph')} aria-label="Parágrafo">P</Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleHeading', { level: 1 })} aria-label="Título H1">
          <Heading1 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleHeading', { level: 2 })} aria-label="Título H2">
          <Heading2 className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleBulletList')} aria-label="Lista com marcadores">
          <List className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleOrderedList')} aria-label="Lista numerada">
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('toggleBlockquote')} aria-label="Citação">
          <Quote className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('undo')} aria-label="Desfazer">
          <Undo className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => toggle('redo')} aria-label="Refazer">
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}