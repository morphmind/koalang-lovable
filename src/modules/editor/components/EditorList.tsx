
import React, { useEffect, useState } from 'react';
import { useEditor } from '../context/EditorContext';
import { List, History, Archive } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { Database } from '../../../types/supabase';
import { LoadingOverlay } from '../../../components';

type EditorContentRow = Database['public']['Tables']['editor_content']['Row'];

export const EditorList: React.FC = () => {
  const [contents, setContents] = useState<EditorContentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadContent } = useEditor();

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = async () => {
    try {
      setIsLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı bulunamadı');

      const { data, error } = await supabase
        .from('editor_content')
        .select()
        .eq('user_id', userData.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error loading contents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <List className="w-4 h-4 text-green-500" />;
      case 'archived':
        return <Archive className="w-4 h-4 text-gray-500" />;
      default:
        return <History className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Yayında';
      case 'archived':
        return 'Arşivlenmiş';
      default:
        return 'Taslak';
    }
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="border-r border-gray-200 w-64 h-full overflow-y-auto bg-white">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">İçerikler</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {contents.map((content) => (
          <button
            key={content.id}
            onClick={() => loadContent(content.id)}
            className="w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 truncate">
                {content.title}
              </span>
              {getStatusIcon(content.status)}
            </div>
            
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <span>{getStatusText(content.status)}</span>
              <span className="mx-1">•</span>
              <span>
                {new Date(content.updated_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </button>
        ))}

        {contents.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            Henüz içerik oluşturulmamış
          </div>
        )}
      </div>
    </div>
  );
};
