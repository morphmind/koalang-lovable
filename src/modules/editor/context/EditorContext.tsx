
import React, { createContext, useContext, useReducer } from 'react';
import { EditorContextType, EditorContent, EditorVersion } from '../types';
import { editorReducer, initialState } from './editorReducer';
import { supabase } from '../../../lib/supabase';

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const loadContent = async (id: string) => {
    try {
      dispatch({ type: 'EDITOR_START' });
      
      const { data, error } = await supabase
        .from('editor_content')
        .select()
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('İçerik bulunamadı');

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

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı bulunamadı');

      const { data, error } = await supabase
        .from('editor_content')
        .update({ ...content, updated_at: new Date().toISOString() })
        .eq('id', content.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('İçerik güncellenemedi');

      // Versiyon geçmişi oluştur
      const { error: historyError } = await supabase
        .from('editor_content_history')
        .insert({
          id: crypto.randomUUID(),
          content_id: content.id,
          content: content.content,
          version: state.versions.length + 1,
          created_by: userData.user.id,
          created_at: new Date().toISOString()
        });

      if (historyError) throw historyError;

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

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Kullanıcı bulunamadı');

      const newContent = {
        id: crypto.randomUUID(),
        title,
        content: {},
        status: 'draft',
        user_id: userData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: null
      };

      const { data, error } = await supabase
        .from('editor_content')
        .insert(newContent)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('İçerik oluşturulamadı');

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
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('İçerik yayınlanamadı');

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
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('İçerik arşivlenemedi');

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
        .select()
        .eq('content_id', contentId)
        .order('version', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_VERSIONS', payload: data || [] });
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
          updated_at: new Date().toISOString()
        })
        .eq('id', version.content_id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Versiyon geri yüklenemedi');

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
