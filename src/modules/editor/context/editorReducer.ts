
import { EditorState, EditorContent, EditorVersion } from '../types';

type EditorAction = 
  | { type: 'EDITOR_START' }
  | { type: 'EDITOR_SUCCESS'; payload: EditorContent }
  | { type: 'EDITOR_FAILURE'; payload: string }
  | { type: 'SET_VERSIONS'; payload: EditorVersion[] }
  | { type: 'RESET_EDITOR' }
  | { type: 'SET_DIRTY'; payload: boolean };

export const initialState: EditorState = {
  currentContent: null,
  isLoading: false,
  error: null,
  isDirty: false,
  versions: [],
};

export const editorReducer = (state: EditorState, action: EditorAction): EditorState => {
  switch (action.type) {
    case 'EDITOR_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'EDITOR_SUCCESS':
      return {
        ...state,
        isLoading: false,
        currentContent: action.payload,
        error: null,
      };
    case 'EDITOR_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SET_VERSIONS':
      return {
        ...state,
        versions: action.payload,
      };
    case 'SET_DIRTY':
      return {
        ...state,
        isDirty: action.payload,
      };
    case 'RESET_EDITOR':
      return initialState;
    default:
      return state;
  }
};
