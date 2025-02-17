
import React from 'react';
import { useEditor } from '../context/EditorContext';
import { Save, Upload, Archive } from 'lucide-react';

export const EditorToolbar: React.FC = () => {
  const { state, saveContent, publishContent, archiveContent } = useEditor();

  const handleSave = async () => {
    if (!state.currentContent) return;
    await saveContent(state.currentContent);
  };

  const handlePublish = async () => {
    if (!state.currentContent) return;
    await publishContent(state.currentContent.id);
  };

  const handleArchive = async () => {
    if (!state.currentContent) return;
    await archiveContent(state.currentContent.id);
  };

  return (
    <div className="border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!state.isDirty}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Kaydet
        </button>
        <button
          onClick={handlePublish}
          disabled={!state.currentContent || state.currentContent.status === 'published'}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Yayınla
        </button>
        <button
          onClick={handleArchive}
          disabled={!state.currentContent || state.currentContent.status === 'archived'}
          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Archive className="w-4 h-4" />
          Arşivle
        </button>
      </div>
      {state.currentContent && (
        <div className="text-sm text-gray-500">
          {state.currentContent.status === 'draft' && 'Taslak'}
          {state.currentContent.status === 'published' && 'Yayında'}
          {state.currentContent.status === 'archived' && 'Arşivde'}
        </div>
      )}
    </div>
  );
};
