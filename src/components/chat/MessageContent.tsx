import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { electronService } from '../../services/electron';

const MarkdownLink = ({ node, ...props }: any) => (
  <button
    {...props}
    type="button"
    className="markdown-link"
    onClick={(e) => {
      e.preventDefault();
      if (props.href) {
        electronService.openExternal(props.href);
      }
    }}
  />
);

interface MessageContentProps {
  text: string;
}

/**
 * Component to render markdown message content with a "See more" limit.
 */
export const MessageContent = ({ text }: MessageContentProps) => {
  const [limit, setLimit] = useState(2000);
  
  if (text === '') return null;

  const isTruncated = text.length > limit;

  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ a: MarkdownLink }}
      >
        {isTruncated ? `${text.substring(0, limit)}...` : text}
      </ReactMarkdown>
      {isTruncated && (
        <button
          type="button"
          className="see-more-btn"
          onClick={() => setLimit(prev => prev + 2000)}
        >
          Ver mais...
        </button>
      )}
    </>
  );
};
