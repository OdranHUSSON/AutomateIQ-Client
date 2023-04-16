import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ReactDOMServer from 'react-dom/server';
import { Button, ButtonGroup, Container, Skeleton, Stack, Box } from '@mui/material';

function copyToClipboard(data) {
  navigator.clipboard.writeText(data)
    .then(() => {
      console.log('Content copied to clipboard successfully!');
    })
    .catch((error) => {
      console.error('Error copying HTML to clipboard:', error);
    });
}

function MarkdownViewer({ jobId, progress }) {
  const [markdownContent, setMarkdownContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  async function fetchMarkdown() {
    if (!jobId) {
      setMarkdownContent('');
      setHtmlContent('');
      return;
    }

    if (progress === 0) {
      setMarkdownContent('Output is generating...');
      setHtmlContent('');
      return;
    }

    const response = await fetch(`http://localhost:3000/markdown/${jobId}`);
    const { content } = await response.json();
    setMarkdownContent(content);

    const html = ReactDOMServer.renderToStaticMarkup(
      <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
    );
    setHtmlContent(html);
  }

  useEffect(() => {
    fetchMarkdown();
  }, [jobId, progress]);

  function handleCopyHtml() {
    copyToClipboard(htmlContent);
  }

  function handleCopyMarkdown() {
    copyToClipboard(markdownContent);
  }

  if (!jobId) {
    return null;
  }

  return (
    <div>
      <Box p={4} className='light-mode'>
        <ReactMarkdown children={markdownContent} remarkPlugins={[remarkGfm]} />
        { jobId && progress != 100 && <Skeleton variant="rectangular" width={"100%"} height={24} /> }
      </Box>
      <ButtonGroup fullWidth aria-label="outlined primary button group">
        {htmlContent &&
          <Button variant="contained" onClick={handleCopyHtml}>Copy HTML</Button>
        }
        {markdownContent &&
          <Button onClick={handleCopyMarkdown}>Copy Markdown</Button>
        }
      </ButtonGroup>
    </div>
  );
}


export default MarkdownViewer;
