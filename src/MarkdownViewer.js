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

function MarkdownViewer({ task }) {
  const [markdownContent, setMarkdownContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    let content = task.output;
    setMarkdownContent(content);

    const html = ReactDOMServer.renderToStaticMarkup(
      <ReactMarkdown children={content} remarkPlugins={[remarkGfm]} />
    );
    setHtmlContent(html);
  }, [task]);

  function handleCopyHtml() {
    copyToClipboard(htmlContent);
  }

  function handleCopyMarkdown() {
    copyToClipboard(markdownContent);
  }

  return (
    <div>
      <Box mt={4} mb={4}>
        <h3>Output of {task.name}</h3>
      </Box>
      <Box p={4} className='light-mode'>
        <ReactMarkdown className='markdown-body' children={markdownContent} remarkPlugins={[remarkGfm]} />
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
