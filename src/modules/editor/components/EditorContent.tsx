import React from 'react';
import { useEditor } from '../context/EditorContext';
import { LoadingOverlay } from '../../../components';

export const EditorContent: React.FC = () => {
  const { state, saveContent } = useEditor();

  if (state.isLoading) {
    return <LoadingOverlay />;
  }

  if (!state.currentContent) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Lütfen düzenlemek için bir içerik seçin veya yeni içerik oluşturun.</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full">
      <textarea
        className="w-full h-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        value={JSON.stringify(state.currentContent.content, null, 2)}
        onChange={(e) => {
          try {
            const content = JSON.parse(e.target.value);
            saveContent({
              ...state.currentContent,
              content,
            });
          } catch (error) {
            console.error('Invalid JSON:', error);
          }
        }}
      />
    </div>
  );
};
