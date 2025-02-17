
import { Database } from '../../../types/supabase';

type Tables = Database['public']['Tables'];

export type EditorContent = Tables['editor_content']['Row'];
export type EditorVersion = Tables['editor_content_history']['Row'];

export type EditorState = {
  currentContent: EditorContent | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  versions: EditorVersion[];
};

export type EditorContextType = {
  state: EditorState;
  loadContent: (id: string) => Promise<void>;
  saveContent: (content: Partial<EditorContent>) => Promise<void>;
  createContent: (title: string) => Promise<string>;
  publishContent: (id: string) => Promise<void>;
  archiveContent: (id: string) => Promise<void>;
  loadVersions: (contentId: string) => Promise<void>;
  restoreVersion: (version: EditorVersion) => Promise<void>;
};
