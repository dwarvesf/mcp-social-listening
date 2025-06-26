export enum Category {
  Ai = 'ai',
  Blockchain = 'blockchain',
  Design = 'design',
  Funding = 'funding',
  Hiring = 'hiring',
  PlatformOps = 'platform-ops',
  Product = 'product',
  Quant = 'quant',
}

export enum Platform {
  Arxiv = 'arxiv',
  Facebook = 'facebook',
  Github = 'github',
  Hackernews = 'hackernews',
  Medium = 'medium',
  Reddit = 'reddit',
  Substack = 'substack',
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

export enum Region {
  Asia = 'asia',
  Eu = 'eu',
  Singapore = 'singapore',
  Uk = 'uk',
  Us = 'us',
  Vietnam = 'vietnam',
}

export enum SourceType {
  Discord = 'discord',
  Facebook = 'facebook',
  Hiring = 'hiring',
  Newsletter = 'newsletter',
  Profile = 'profile',
  Reddit = 'reddit',
  Repository = 'repository',
  Rss = 'rss',
  Webpage = 'webpage',
  X = 'x',
}

export interface Link {
  category?: Category;
  id?: number; // Made optional
  last_error_message?: string;
  last_processed_at?: string;
  platform?: Platform;
  processing_attempts?: number;
  processing_status?: ProcessingStatus;
  region?: Region;
  source_type?: SourceType;
  title?: string;
  url: string;
}

export interface Source {
  category?: Category;
  created_at: string;
  id: number;
  is_active?: boolean;
  last_fetched_at?: string;
  last_successful_fetch_at?: string;
  metadata?: SourceMetadata[];
  name: string;
  platform?: Platform;
  region?: Region;
  type?: SourceType;
  url: string;
}

export interface SourceMetadata {
  attribute: string;
  container_css_selector: string;
  link_css_selector: string;
  single_url_pattern: string;
  wait_for: string;
}

export type SubmitSource = Pick<Source, 'name' | 'platform' | 'type' | 'url'>;

export enum MemberType {
  Dwarves = 'dwarves',
  Alumni = 'alumni',
  Community = 'community',
}
