export interface UpdateState {
  status:
    | 'idle'
    | 'unsupported'
    | 'checking'
    | 'current'
    | 'available'
    | 'downloading'
    | 'downloaded'
    | 'installing'
    | 'error';
  currentVersion: string;
  version: string | null;
  notes: string;
  percent: number;
  error: string;
}
export interface UpdateBridge {
  getState(): Promise<UpdateState>;
  check(): Promise<UpdateState>;
  download(): Promise<UpdateState>;
  install(): Promise<boolean>;
  openRelease(): Promise<void>;
  subscribe(listener: (state: UpdateState) => void): () => void;
}
declare global {
  interface Window {
    byteUpdates?: UpdateBridge;
  }
}
