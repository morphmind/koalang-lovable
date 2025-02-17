
import React from 'react';
import { useEditor } from '../context/EditorContext';
import { Save, Send, Archive } from 'lucide-react';

export const EditorToolbar: React.FC = () => {
  const { state, saveContent, publishContent, archiveContent } = useEditor();

  const handleSave = async () => {
    if (state.currentContent) {
      await saveContent(state.currentContent);
    }
  };

  const handlePublish = async () => {
    if (state.currentContent) {
      await publishContent(state.currentContent.id);
    }
  };

  const handleArchive = async () => {
    if (state.currentContent) {
      await archiveContent(state.currentContent.id);
    }
  };

  return (
    <div className="border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-lg font-semibold">
          {state.currentContent ? state.currentContent.title : 'İçerik Düzenleyici'}
        </h1>
        {state.isDirty && <span className="text-sm text-gray-500">(Kaydedilmemiş değişiklikler)</span>}
      </div>
      
      <div className="flex items-center space-x-4">
        <button
          onClick={handleSave}
          disabled={!state.isDirty}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          Kaydet
        </button>
        
        <button
          onClick={handlePublish}
          disabled={!state.currentContent || state.currentContent.status === 'published'}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-500 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-2" />
          Yayınla
        </button>
        
        <button
          onClick={handleArchive}
          disabled={!state.currentContent || state.currentContent.status === 'archived'}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Archive className="w-4 h-4 mr-2" />
          Arşivle
        </button>
      </div>
    </div>
  );
};
