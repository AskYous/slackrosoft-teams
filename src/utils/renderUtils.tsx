import DOMPurify from 'dompurify';
import { ReactElement } from 'react';

/**
 * Safely renders any content from the MS Graph API as a React element
 * Prevents "Objects are not valid as React child" errors
 */
export const safeRenderContent = (content: unknown): ReactElement => {
  // Handle null/undefined
  if (content == null) {
    return <></>;
  }

  // Handle string content - Assume it might be HTML, sanitize and render
  if (typeof content === 'string') {
    // Sanitize the HTML content
    const cleanHtml = DOMPurify.sanitize(content);
    // Render the sanitized HTML using a span for inline rendering
    // Added 'prose dark:prose-invert max-w-none break-words' from the other case for consistency
    return <span className="prose dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
  }

  // Handle objects - deep parsing for nested content objects
  if (typeof content === 'object') {
    const obj = content as Record<string, unknown>;

    // Handle common object structures from the Graph API

    // Case 1: Object with a content property (common in messages)
    if ('content' in obj && obj.content != null) {
      return safeRenderContent(obj.content);
    }

    // Case 2: Object with a message property (common in statusMessage)
    if ('message' in obj && obj.message != null) {
      return safeRenderContent(obj.message);
    }

    // Case 3: HTML content (explicitly marked)
    if ('contentType' in obj && obj.contentType === 'html' && typeof obj.content === 'string') {
      // Sanitize the HTML content
      const cleanHtml = DOMPurify.sanitize(obj.content);
      // Render the sanitized HTML using a div as it's likely block content
      // Added 'prose dark:prose-invert max-w-none break-words' for basic typography styling and word wrap
      return <div className="prose dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
    }

    // Fallback - show placeholder for complex objects
    return <>[Complex Data]</>;
  }

  // Handle primitives (numbers, booleans)
  return <>{String(content)}</>;
};

/**
 * A simpler version that just returns a string representation of any content
 * Useful for cases where you need a string but not a React element
 */
export const safeStringContent = (content: unknown): string => {
  if (content == null) {
    return '';
  }

  if (typeof content === 'string') {
    return content;
  }

  if (typeof content === 'object') {
    const obj = content as Record<string, unknown>;

    if ('content' in obj && typeof obj.content === 'string') {
      return obj.content;
    }

    if ('message' in obj && typeof obj.message === 'string') {
      return obj.message;
    }

    return '[Complex Data]';
  }

  return String(content);
}; 