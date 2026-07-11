import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { ImageFigure } from './tiptap-image-figure';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';


import './rich-content.css';

import {
  BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
  ListBulletIcon, QueueListIcon, LinkIcon, PhotoIcon,
  ChatBubbleBottomCenterTextIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon,
  TableCellsIcon, TrashIcon,
  ArrowDownOnSquareIcon, ArrowRightOnRectangleIcon,
  MinusCircleIcon, XCircleIcon,
  Bars3BottomLeftIcon, Bars3Icon, Bars3BottomRightIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      ImageFigure,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Nhập nội dung...' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'rich-content px-4 py-3 focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const prevUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Nhập URL liên kết:', prevUrl ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Nhập URL hình ảnh:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };
  const editImageCaption = () => {
    const current = (editor.getAttributes('image').caption as string) || '';
    const caption = window.prompt('Chú thích ảnh (để trống để xoá):', current);
    if (caption === null) return;
    editor.chain().focus().updateAttributes('image', { caption: caption.trim() || null }).run();
  };

  const setImageAlign = (align: 'left' | 'center' | 'right') => {
    editor.chain().focus().updateAttributes('image', { align }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 rounded-t-lg">
        <select
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' : '0'
          }
          onChange={e => {
            const level = Number(e.target.value);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
          }}
          className="text-sm border border-slate-200 rounded-md px-2 py-1.5 mr-1 bg-white text-slate-700"
        >
          <option value="0">Đoạn văn</option>
          <option value="1">Tiêu đề 1</option>
          <option value="2">Tiêu đề 2</option>
          <option value="3">Tiêu đề 3</option>
        </select>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton title="Đậm" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <BoldIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Nghiêng" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <ItalicIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Gạch chân" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Gạch ngang" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <StrikethroughIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton title="Danh sách gạch đầu dòng" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <ListBulletIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Danh sách đánh số" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <QueueListIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Trích dẫn" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton title="Căn trái" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <Bars3BottomLeftIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Căn giữa" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <Bars3Icon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Căn phải" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <Bars3BottomRightIcon className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton title="Chèn liên kết" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Chèn ảnh (URL)" onClick={addImage}>
          <PhotoIcon className="w-4 h-4" />
        </ToolbarButton>
        {editor.isActive('image') && (
          <>
            <ToolbarButton
              title="Căn ảnh trái"
              active={editor.getAttributes('image').align === 'left'}
              onClick={() => setImageAlign('left')}
            >
              <Bars3BottomLeftIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Căn ảnh giữa"
              active={editor.getAttributes('image').align === 'center'}
              onClick={() => setImageAlign('center')}
            >
              <Bars3Icon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              title="Căn ảnh phải"
              active={editor.getAttributes('image').align === 'right'}
              onClick={() => setImageAlign('right')}
            >
              <Bars3BottomRightIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton title="Chú thích ảnh" onClick={editImageCaption}>
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <ToolbarButton title="Chèn bảng" onClick={insertTable}>
          <TableCellsIcon className="w-4 h-4" />
        </ToolbarButton>

        {editor.isActive('table') && (
          <>
            <ToolbarButton title="Thêm hàng bên dưới" onClick={() => editor.chain().focus().addRowAfter().run()}>
              <ArrowDownOnSquareIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton title="Thêm cột bên phải" onClick={() => editor.chain().focus().addColumnAfter().run()}>
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton title="Xoá hàng hiện tại" onClick={() => editor.chain().focus().deleteRow().run()}>
              <MinusCircleIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton title="Xoá cột hiện tại" onClick={() => editor.chain().focus().deleteColumn().run()}>
              <XCircleIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton title="Xoá cả bảng" onClick={() => editor.chain().focus().deleteTable().run()}>
              <TrashIcon className="w-4 h-4" />
            </ToolbarButton>
          </>
        )}

        <ToolbarButton title="Hoàn tác" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
          <ArrowUturnLeftIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Làm lại" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
          <ArrowUturnRightIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}