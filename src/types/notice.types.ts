export type NoticeLevel = 'NORMAL' | 'IMPORTANT' | 'URGENT';

export interface Notice {
  id: string;
  title: string;
  description: string;
  level: NoticeLevel;
  isSent: boolean;
  sentAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
  group: {
    id: string;
  };
}

export interface CreateNoticeInput {
  title: string;
  description: string;
  level?: NoticeLevel;
  groupId: string;
  isSent?: boolean;
}

export interface UpdateNoticeInput {
  title?: string;
  description?: string;
  level?: NoticeLevel;
}
