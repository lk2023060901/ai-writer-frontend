export interface RichEditorRef {
  getScrollTop?: () => number;
  setScrollTop?: (scrollTop: number) => void;
  focus?: () => void;
  blur?: () => void;
}

export interface RichEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
  style?: React.CSSProperties;
}
