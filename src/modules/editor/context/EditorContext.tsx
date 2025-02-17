
import React, { createContext, useContext, useReducer } from 'react';
import { EditorContextType, EditorContent, EditorVersion } from '../types';
import { editorReducer, initialState } from './editorReducer';
import { supabase } from '../../../lib/supabase';
import { Database } from '../../../types/supabase';

const EditorContext = createContext<EditorContextType | undefined>(undefined);

type Tables = Database['public']['Tables'];
type EditorContentInsert = Tables['editor_content']['Insert'];
type EditorContentUpdate = Tables['editor_content']['Update'];
type EditorHistoryInsert = Tables['editor_content_history']['Insert'];

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const loadContent = async (id: string) => {
    try {
      dispatch({ type: 'EDITOR_START' });
      
      const { data, error } = await supabase
        .from('editor_content')
        .select()
        .eq('id', id)
        .maybeSingle();

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

      const updateData: EditorContentUpdate = {
        content: content.content,
        title: content.title,
        status: content.status,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('editor_content')
        .update(updateData)
        .eq('id', content.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('İçerik güncellenemedi');

      // Versiyon geçmişi oluştur
      const historyData: EditorHistoryInsert = {
        content_id: content.id,
        content: content.content,
        version: state.versions.length + 1,
        created_by: userData.user.id
      };

      const { error: historyError } = await supabase
        .from('editor_content_history')
        .insert(historyData);

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

      const insertData: EditorContentInsert = {
        title,
        content: {},
        status: 'draft',
        user_id: userData.user.id
      };

      const { data, error } = await supabase
        .from('editor_content')
        .insert(insertData)
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

      const updateData: EditorContentUpdate = {
        status: 'published',
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('editor_content')
        .update(updateData)
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

      const updateData: EditorContentUpdate = {
        status: 'archived',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('editor_content')
        .update(updateData)
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
    }
  };

  const restoreVersion = async (version: EditorVersion) => {
    try {
      dispatch({ type: 'EDITOR_START' });

      const updateData: EditorContentUpdate = {
        content: version.content,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('editor_content')
        .update(updateData)
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
