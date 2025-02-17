
import React from 'react';
import { EditorProvider } from '../context/EditorContext';
import { EditorContent } from './EditorContent';
import { EditorToolbar } from './EditorToolbar';
import { EditorList } from './EditorList';

export const Editor: React.FC = () => {
  return (
    <EditorProvider>
      <div className="flex h-full">
        <EditorList />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <EditorToolbar />
          <EditorContent />
        </div>
      </div>
    </EditorProvider>
  );
};
