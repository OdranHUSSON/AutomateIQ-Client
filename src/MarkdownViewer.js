import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function MarkdownViewer({ jobId, progress }) {
  const [markdownContent, setMarkdownContent] = useState('');

  async function fetchMarkdown() {
    if (!jobId) {
      setMarkdownContent('');
      return;
    }

    if (progress !== 100) {
      setMarkdownContent('Output is generating...');
      return;
    }

    const response = await fetch(`http://localhost:3000/markdown/${jobId}`);
    const { content } = await response.json();
    setMarkdownContent(content);
  }

  useEffect(() => {
    fetchMarkdown();
  }, [jobId, progress]);

  if (!jobId) {
    return null;
  }

  return (
    <div>
      <ReactMarkdown children={markdownContent} remarkPlugins={[remarkGfm]} />
      <button onClick={fetchMarkdown}>Refresh</button>
    </div>
  );
}

export default MarkdownViewer;
