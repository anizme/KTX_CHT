import DOMPurify from 'dompurify';
import './rich-content.css';

const purifyConfig = {
  ADD_TAGS: ['figure', 'figcaption'],
  ADD_ATTR: ['data-align', 'align', 'colspan', 'rowspan', 'style'],
};

export default function RichContent({ content }: { content: string }) {
  const clean = DOMPurify.sanitize(content, purifyConfig);
  return (
    <div
      className="rich-content [&_table]:block [&_table]:overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}