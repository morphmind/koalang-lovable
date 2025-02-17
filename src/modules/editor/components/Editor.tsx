
import React from 'react';
import { useEditor } from '../context/EditorContext';
import { EditorToolbar } from './EditorToolbar';
import { EditorContent } from './EditorContent';
import { EditorHistory } from './EditorHistory';
import { LoadingOverlay } from '@/components';

const Editor: React.FC = () => {
  const { state } = useEditor();

  if (state.isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="flex flex-col h-full">
      <EditorToolbar />
      <div className="flex-1 flex gap-4">
        <div className="flex-1">
          <EditorContent />
        </div>
        <div className="w-64 border-l border-gray-200 p-4">
          <EditorHistory />
        </div>
      </div>
    </div>
  );
};

export default Editor;
