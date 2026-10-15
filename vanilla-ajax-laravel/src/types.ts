export interface Post {
  id: number;
  title: string;
  body: string;
  created_at?: string | null;
}

export type AlertType = 'danger' | 'warning' | 'success';

export interface AlertData {
  message: string;
  type: AlertType;
}

export interface ModalData {
  id: Post['id'] | null;
  title: string;
  body: string;
}
