
import React, { createContext, useContext, useReducer } from 'react';
import { EditorContextType, EditorContent, EditorVersion } from '../types';
import { editorReducer, initialState } from './editorReducer';
import { supabase } from '@/lib/supabase';

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const loadContent = async (id: string) => {
    try {
      dispatch({ type: 'EDITOR_START' });
      
      const { data, error } = await supabase
        .from('editor_content')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      dispatch({ type: 'EDITOR_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error loading content:', error);
      dispatch({ type: 'EDITOR_FAILURE', payload: 'İçerik yüklenirken bir hata oluştu.' });
    }
  };

  const saveContent = async (content: Partial<EditorContent>) => {
    try {
      dispatch({ type: 'EDITOR_START' });

      if (!content.id) throw new Error('Content ID is required');

      const { data, error } = await supabase
        .from('editor_content')
        .update(content)
        .eq('id', content.id)
        .select()
        .single();

      if (error) throw error;

      // Versiyon geçmişi oluştur
      await supabase.from('editor_content_history').insert({
        content_id: content.id,
        content: content.content,
        version: state.versions.length + 1,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      dispatch({ type: 'EDITOR_SUCCESS', payload: data });
      dispatch({ type: 'SET_DIRTY', payload: false });
    } catch (error) {
      console.error('Error saving content:', error);
      dispatch({ type: 'EDITOR_FAILURE', payload: 'İçerik kaydedilirken bir hata oluştu.' });
    }
  };

  const createContent = async (title: string): Promise<string> => {
    try {
      dispatch({ type: 'EDITOR_START' });

      const { data, error } = await supabase
        .from('editor_content')
        .insert({
          title,
          content: {},
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'EDITOR_SUCCESS', payload: data });
      return data.id;
    } catch (error) {
      console.error('Error creating content:', error);
      dispatch({ type: 'EDITOR_FAILURE', payload: 'Yeni içerik oluşturulurken bir hata oluştu.' });
      throw error;
    }
  };

  const publishContent = async (id: string) => {
    try {
      dispatch({ type: 'EDITOR_START' });

      const { data, error } = await supabase
        .from('editor_content')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'EDITOR_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error publishing content:', error);
      dispatch({ type: 'EDITOR_FAILURE', payload: 'İçerik yayınlanırken bir hata oluştu.' });
    }
  };

  const archiveContent = async (id: string) => {
    try {
      dispatch({ type: 'EDITOR_START' });

      const { data, error } = await supabase
        .from('editor_content')
        .update({
          status: 'archived',
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'EDITOR_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error archiving content:', error);
      dispatch({ type: 'EDITOR_FAILURE', payload: 'İçerik arşivlenirken bir hata oluştu.' });
    }
  };

  const loadVersions = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('editor_content_history')
        .select('*')
        .eq('content_id', contentId)
        .order('version', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_VERSIONS', payload: data });
    } catch (error) {
      console.error('Error loading versions:', error);
      // Versiyon yükleme hatası kritik olmadığı için state'i bozmuyoruz
    }
  };

  const restoreVersion = async (version: EditorVersion) => {
    try {
      dispatch({ type: 'EDITOR_START' });

      const { data, error } = await supabase
        .from('editor_content')
        .update({
          content: version.content,
        })
        .eq('id', version.content_id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'EDITOR_SUCCESS', payload: data });
    } catch (error) {
      console.error('Error restoring version:', error);
      dispatch({ type: 'EDITOR_FAILURE', payload: 'Versiyon geri yüklenirken bir hata oluştu.' });
    }
  };

  return (
    <EditorContext.Provider
      value={{
        state,
        loadContent,
        saveContent,
        createContent,
        publishContent,
        archiveContent,
        loadVersions,
        restoreVersion,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
