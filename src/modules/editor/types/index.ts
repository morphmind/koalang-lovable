
export type EditorContent = {
  id: string;
  title: string;
  content: Record<string, any>;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EditorVersion = {
  id: string;
  content_id: string;
  version: number;
  content: Record<string, any>;
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
