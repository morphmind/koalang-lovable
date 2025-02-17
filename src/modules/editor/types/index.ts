
import { Json } from '../../../types/supabase';

export type EditorContent = {
  id: string;
  user_id: string;
  title: string;
  content: Json;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type EditorVersion = {
  id: string;
  content_id: string;
  content: Json;
  version: number;
  created_by: string;
  created_at: string;
};

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
