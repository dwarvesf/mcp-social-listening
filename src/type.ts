export enum Platform {
  Arxiv = 'arxiv',
  Facebook = 'facebook',
  Github = 'github',
  Hackernews = 'hackernews',
  Website = 'website',
  X = 'x',
  Youtube = 'youtube',
}

export enum ProcessingStatus {
  Done = 'done',
  Failed = 'failed',
  Pending = 'pending',
  Processing = 'processing',
}

export enum SourceType {
  Hiring = 'hiring',
  Newsletter = 'newsletter',
  Profile = 'profile',
  Repository = 'repository',
  Rss = 'rss',
}

export interface Link {
  id: number;
  last_error_message?: string;
  last_processed_at?: string;
  platform?: Platform;
  processing_attempts?: number;
  processing_status?: ProcessingStatus;
  source_type?: SourceType;
  title?: string;
  url: string;
}

export interface Source {
  created_at: string;
  id: number;
  is_active?: boolean;
  last_fetched_at?: string;
  last_successful_fetch_at?: string;
  name: string;
  platform?: Platform;
  type?: SourceType;
  url: string;
}

export type SubmitSource = Pick<Source, 'name' | 'platform' | 'type' | 'url'>;
