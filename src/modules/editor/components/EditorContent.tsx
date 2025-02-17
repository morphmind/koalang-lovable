
import React, { useEffect, useState } from 'react';
import { useEditor } from '../context/EditorContext';

export const EditorContent: React.FC = () => {
  const { state, saveContent } = useEditor();
  const [localContent, setLocalContent] = useState<string>('');

  useEffect(() => {
    if (state.currentContent) {
      setLocalContent(JSON.stringify(state.currentContent.content, null, 2));
    }
  }, [state.currentContent]);

  const handleContentChange = (value: string) => {
    setLocalContent(value);
    try {
      const parsedContent = JSON.parse(value);
      if (state.currentContent) {
        saveContent({
          ...state.currentContent,
          content: parsedContent,
        });
      }
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  };

  if (!state.currentContent) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        İçerik seçilmedi
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <div className="mb-4">
        <input
          type="text"
          value={state.currentContent.title}
          onChange={(e) => {
            if (state.currentContent) {
              saveContent({
                ...state.currentContent,
                title: e.target.value,
              });
            }
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="İçerik başlığı"
        />
      </div>
      <textarea
        value={localContent}
        onChange={(e) => handleContentChange(e.target.value)}
        className="w-full h-[calc(100%-4rem)] p-4 font-mono text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="İçeriği JSON formatında girin"
      />
    </div>
  );
};
