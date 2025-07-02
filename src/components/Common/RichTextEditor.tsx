// src/components/Common/RichTextEditor.tsx
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  List, 
  ListOrdered,
  Image as ImageIcon,
  Link,
  Quote,
  Undo,
  Redo
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showWordCount?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
  readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your story...",
  className = "",
  maxLength = 10000,
  showWordCount = true,
  onImageUpload,
  readOnly = false
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Save and restore cursor position
  const saveCursorPosition = useCallback(() => {
    if (!editorRef.current) return null;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    
    return {
      start: preCaretRange.toString().length,
      end: preCaretRange.toString().length + range.toString().length
    };
  }, []);

  const restoreCursorPosition = useCallback((position: { start: number; end: number }) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    let charIndex = 0;
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    const range = document.createRange();
    let startNode: Node | null = null;
    let endNode: Node | null = null;
    let startOffset = 0;
    let endOffset = 0;
    
    let node;
    while ((node = walker.nextNode()) !== null) {
      const nodeLength = node.textContent?.length || 0;
      
      if (!startNode && charIndex + nodeLength >= position.start) {
        startNode = node;
        startOffset = position.start - charIndex;
      }
      
      if (!endNode && charIndex + nodeLength >= position.end) {
        endNode = node;
        endOffset = position.end - charIndex;
        break;
      }
      
      charIndex += nodeLength;
    }
    
    if (startNode) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode || startNode, endNode ? endOffset : startOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, []);

  // Update content without losing cursor position
  const updateContent = useCallback((newContent: string) => {
    if (!editorRef.current || isUpdating) return;
    
    const cursorPos = saveCursorPosition();
    setIsUpdating(true);
    
    // Only update if content actually changed
    if (editorRef.current.innerHTML !== newContent) {
      editorRef.current.innerHTML = newContent;
      
      // Restore cursor position after a brief delay
      requestAnimationFrame(() => {
        if (cursorPos && editorRef.current) {
          restoreCursorPosition(cursorPos);
        }
        setIsUpdating(false);
      });
    } else {
      setIsUpdating(false);
    }
  }, [saveCursorPosition, restoreCursorPosition, isUpdating]);

  // Update editor content when value prop changes (only when not actively editing)
  useEffect(() => {
    if (editorRef.current && !isUpdating && editorRef.current.innerHTML !== value) {
      updateContent(value);
    }
  }, [value, updateContent, isUpdating]);

  // Execute document command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle content change
  const handleContentChange = useCallback(() => {
    if (editorRef.current && !isUpdating) {
      const content = editorRef.current.innerHTML;
      if (content.length <= maxLength) {
        // Prevent infinite loops by checking if content actually changed
        if (content !== value) {
          onChange(content);
        }
      }
    }
  }, [onChange, maxLength, isUpdating, value]);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    execCommand('insertText', text);
  }, [execCommand]);

  // Default image upload handler
  const defaultImageUpload = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      console.log('Starting image upload...', file.name);
      const imageUploadHandler = onImageUpload || defaultImageUpload;
      const imageUrl = await imageUploadHandler(file);
      console.log('Image uploaded, URL:', imageUrl);
      
      // Focus the editor first
      if (editorRef.current) {
        editorRef.current.focus();
      }
      
      // Insert image with proper HTML structure and resize capabilities
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const imageHtml = `<div class="image-container" style="margin: 10px 0; text-align: center;"><img id="${imageId}" src="${imageUrl}" alt="Uploaded image" style="max-width: 100%; width: 300px; height: auto; border-radius: 8px; cursor: pointer; border: 2px solid transparent;" draggable="false" /></div><p><br></p>`;
      
      // Insert the image at cursor position
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = imageHtml;
        
        // Insert each child node
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        
        range.insertNode(fragment);
        
        // Move cursor after the inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        console.log('Image inserted into DOM');
      } else {
        console.log('No selection found, appending to end');
        // Fallback: append to end of editor
        if (editorRef.current) {
          editorRef.current.innerHTML += imageHtml;
        }
      }
      
      // Update content
      if (editorRef.current) {
        console.log('Updating content with onChange');
        onChange(editorRef.current.innerHTML);
      }
      
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  // Handle image button click
  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
    e.target.value = ''; // Reset input
  };

  // Insert link
  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      execCommand('insertHTML', linkHtml);
      setIsLinkModalOpen(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  // Get word count
  const getWordCount = () => {
    if (editorRef.current) {
      const text = editorRef.current.textContent || '';
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
    return 0;
  };

  // Get character count
  const getCharCount = () => {
    if (editorRef.current) {
      return editorRef.current.textContent?.length || 0;
    }
    return 0;
  };

  const toolbarButtons = [
    { icon: Bold, command: 'bold', title: 'Bold' },
    { icon: Italic, command: 'italic', title: 'Italic' },
    { icon: Underline, command: 'underline', title: 'Underline' },
    { type: 'separator' as const },
    { icon: AlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', title: 'Align Right' },
    { type: 'separator' as const },
    { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { type: 'separator' as const },
    { icon: ImageIcon, action: handleImageClick, title: 'Insert Image' },
    { icon: Link, action: () => setIsLinkModalOpen(true), title: 'Insert Link' },
    { type: 'separator' as const },
    { icon: Undo, command: 'undo', title: 'Undo' },
    { icon: Redo, command: 'redo', title: 'Redo' },
  ];

  if (readOnly) {
    return (
      <div className={`prose max-w-none ${className}`}>
        <div 
          dangerouslySetInnerHTML={{ __html: value }}
          className="min-h-[200px] p-4 border border-gray-200 rounded-lg bg-gray-50"
        />
      </div>
    );
  }

  return (
    <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <style>{`
        [contenteditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
          font-style: italic;
        }
        [contenteditable="true"]:focus:before {
          content: none;
        }
        
        /* Image resize and selection styles */
        .editor-content img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
          transition: border-color 0.2s ease;
          border-radius: 8px;
          border: 2px solid transparent;
        }
        
        .editor-content img:hover {
          border-color: #3b82f6;
        }
        
        .editor-content img[data-selected="true"] {
          border-color: #3b82f6 !important;
          resize: both !important;
          overflow: auto !important;
          outline: 1px solid rgba(59, 130, 246, 0.3);
          outline-offset: 2px;
        }
        
        .editor-content .image-container {
          margin: 10px 0;
          text-align: center;
          position: relative;
        }
        
        /* Custom resize handle styling */
        .editor-content img[data-selected="true"]::-webkit-resizer {
          border: 2px solid #3b82f6;
          background: #fff;
          border-radius: 3px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return (
              <div key={index} className="w-px h-6 bg-gray-300 mx-1" />
            );
          }

          const IconComponent = button.icon;
          if (!IconComponent) return null;
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (button.action) {
                  button.action();
                } else if (button.command) {
                  execCommand(button.command, button.value);
                }
              }}
              className="p-2 hover:bg-gray-200 rounded transition-colors duration-200"
              title={button.title}
            >
              <IconComponent className="h-4 w-4" />
            </button>
          );
        })}

        {/* Font Size Selector */}
        <select
          onChange={(e) => execCommand('fontSize', e.target.value)}
          className="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
          title="Font Size"
        >
          <option value="1">Small</option>
          <option value="3" selected>Normal</option>
          <option value="5">Large</option>
          <option value="7">Extra Large</option>
        </select>

        {/* Heading Selector */}
        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
          title="Heading"
        >
          <option value="div">Normal</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        onInput={handleContentChange}
        onPaste={handlePaste}
        onKeyDown={(e) => {
          // Prevent cursor jumping on space and enter
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
          }
          
          // Handle image deletion
          if (e.key === 'Delete' || e.key === 'Backspace') {
            const selectedImg = editorRef.current?.querySelector('img[data-selected="true"]');
            if (selectedImg) {
              e.preventDefault();
              // Remove the image container or just the image
              const container = selectedImg.closest('.image-container');
              if (container) {
                container.remove();
              } else {
                selectedImg.remove();
              }
              // Update content
              if (editorRef.current) {
                onChange(editorRef.current.innerHTML);
              }
            }
          }
        }}
        onClick={(e) => {
          // Handle image selection and enable resize
          const target = e.target as HTMLElement;
          if (target.tagName === 'IMG') {
            e.stopPropagation();
            
            // Remove previous selections
            const allImages = editorRef.current?.querySelectorAll('img');
            allImages?.forEach(img => {
              img.style.border = '2px solid transparent';
              img.removeAttribute('data-selected');
            });
            
            // Select current image
            target.style.border = '2px solid #3b82f6';
            target.setAttribute('data-selected', 'true');
            
            // Add resize handles by making it temporarily replaceable
            setTimeout(() => {
              const img = target as HTMLImageElement;
              const currentWidth = img.offsetWidth;
              
              // Add resize attribute
              img.style.resize = 'both';
              img.style.overflow = 'auto';
              img.style.display = 'block';
              img.style.minWidth = '50px';
              img.style.minHeight = '50px';
              img.style.maxWidth = '100%';
              
              // Set explicit dimensions for resizing
              img.style.width = currentWidth + 'px';
              img.style.height = 'auto';
            }, 10);
          } else {
            // Remove all image selections if clicking elsewhere
            const allImages = editorRef.current?.querySelectorAll('img');
            allImages?.forEach(img => {
              img.style.border = '2px solid transparent';
              img.style.resize = '';
              img.style.overflow = '';
              img.removeAttribute('data-selected');
            });
          }
        }}
        className="min-h-[300px] p-4 focus:outline-none prose max-w-none editor-content"
        style={{ 
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}
        data-placeholder={placeholder}
      />

      {/* File input for images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Status bar */}
      {showWordCount && (
        <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 flex justify-between text-sm text-gray-600">
          <div>
            Words: {getWordCount()} | Characters: {getCharCount()}
          </div>
          <div>
            {getCharCount()}/{maxLength}
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter link text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsLinkModalOpen(false);
                  setLinkUrl('');
                  setLinkText('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
