export type Regulator = 'SEBI' | 'RBI' | 'MCA' | 'CBDT' | 'CBIC';

export type ImpactTag =
  | 'RA compliance'
  | 'tax filing'
  | 'AML/KYC'
  | 'disclosure norms'
  | 'audit requirements'
  | 'investment products'
  | 'foreign exchange'
  | 'corporate governance'
  | 'fintech & payments'
  | 'other';

export const ALL_REGULATORS: Regulator[] = ['SEBI', 'RBI', 'MCA', 'CBDT', 'CBIC'];

export const ALL_IMPACT_TAGS: ImpactTag[] = [
  'RA compliance',
  'tax filing',
  'AML/KYC',
  'disclosure norms',
  'audit requirements',
  'investment products',
  'foreign exchange',
  'corporate governance',
  'fintech & payments',
  'other',
];

export interface NotificationItem {
  id: string;
  regulator: Regulator;
  title: string;
  refNumber: string;
  publishDate: string; // YYYY-MM-DD or ISO
  sourceUrl: string;
  rawText: string;
  aiSummary: string;
  impactTags: string[];
  applicableEntities: string[];
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  keyActionItems?: string[];
  scrapedAt: string;
  isNew?: boolean;
}

export interface UserPreferences {
  id: string;
  name: string;
  email: string;
  selectedRegulators: Regulator[];
  selectedTags: string[];
  defaultFilterOnlySelected: boolean;
  themeMode: 'dark-terminal' | 'light-fintech';
}

export interface SavedItem {
  id: string;
  userId: string;
  notificationId: string;
  savedAt: string;
  personalNote: string;
  notification?: NotificationItem;
}

export interface ScraperSource {
  id: string;
  regulator: Regulator;
  name: string;
  url: string;
  frequency: string;
  lastScrapeTime: string;
  lastScrapeStatus: 'success' | 'failed' | 'idle' | 'running';
  lastScrapeMessage: string;
  totalItemsScraped: number;
}

export interface DailyDigest {
  date: string;
  totalNotifications: number;
  highUrgencyCount: number;
  executiveBrief: string;
  topActionItems: string[];
  regulatorBreakdown: Record<Regulator, number>;
  items: NotificationItem[];
}
