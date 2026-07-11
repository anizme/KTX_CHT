import Image from '@tiptap/extension-image';

export const ImageFigure = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        renderHTML: attributes => ({ 'data-align': attributes.align }),
      },
      caption: {
        default: null,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        getAttrs: (dom) => {
          if (!(dom instanceof HTMLElement)) return false;
          const img = dom.querySelector('img');
          if (!img) return false;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            align: dom.getAttribute('data-align') || 'center',
            caption: dom.querySelector('figcaption')?.textContent || null,
          };
        },
      },
      // fallback: ảnh dán vào từ nguồn khác, không có figure bọc sẵn
      { tag: 'img[src]' },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const align = node.attrs.align || 'center';
    const caption = node.attrs.caption;
    const { 'data-align': _drop, ...imgAttrs } = HTMLAttributes;

    const children: any[] = [['img', imgAttrs]];
    if (caption) children.push(['figcaption', {}, caption]);

    return ['figure', { class: `img-align-${align}`, 'data-align': align }, ...children];
  },
});