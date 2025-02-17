
import React, { useEffect } from 'react';
import { useEditor } from '../context/EditorContext';
import { format } from 'date-fns';

export const EditorHistory: React.FC = () => {
  const { state, loadVersions, restoreVersion } = useEditor();

  useEffect(() => {
    if (state.currentContent) {
      loadVersions(state.currentContent.id);
    }
  }, [state.currentContent]);

  if (!state.currentContent) {
    return null;
  }

  return (
    <div className="h-full">
      <h3 className="text-lg font-semibold mb-4">Versiyon Geçmişi</h3>
      <div className="space-y-4">
        {state.versions.map((version) => (
          <div
            key={version.id}
            className="p-4 border border-gray-200 rounded"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm font-medium">
                Versiyon {version.version}
              </div>
              <button
                onClick={() => restoreVersion(version)}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                Bu versiyona dön
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {format(new Date(version.created_at), 'dd.MM.yyyy HH:mm')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
