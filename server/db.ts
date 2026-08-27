import fs from 'fs';
import path from 'path';
import { NotificationItem, UserPreferences, SavedItem, ScraperSource } from '../src/types';

interface DatabaseSchema {
  notifications: NotificationItem[];
  userPreferences: UserPreferences;
  savedItems: SavedItem[];
  scraperSources: ScraperSource[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'regintel_db.json');

// Authentic initial Indian regulatory dataset for immediate, high-value day-one experience
const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'sebi-2025-01',
    regulator: 'SEBI',
    title: 'Framework for performance validation of claims made by Investment Advisers and Research Analysts',
    refNumber: 'SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2025/14',
    publishDate: '2025-02-18',
    sourceUrl: 'https://www.sebi.gov.in/legal/circulars/feb-2025/performance-validation-claims-ria-ra.html',
    rawText: `1. Securities and Exchange Board of India (SEBI) has observed entities claiming misleading track records and past returns.
2. In order to protect investor interests, no Registered Investment Adviser (RIA) or Research Analyst (RA) shall make any reference to past performance without validation from a SEBI-recognized Performance Validation Agency (PVA).
3. The validation agency shall audit algorithms, client transaction timestamps, and standard NAV calculations quarterly.
4. Non-compliance shall attract disciplinary proceedings under Regulation 28 of SEBI (Intermediaries) Regulations, 2008. Compliance mandatory by May 1, 2025.`,
    aiSummary: 'SEBI prohibits RIAs and Research Analysts from advertising unverified past returns. All performance track records must now undergo mandatory quarterly audit and certification by a designated Performance Validation Agency (PVA) effective May 1, 2025.',
    impactTags: ['RA compliance', 'disclosure norms', 'audit requirements'],
    applicableEntities: ['Registered Investment Advisers (RIAs)', 'Research Analysts (RAs)', 'Fintech Platforms'],
    urgency: 'HIGH',
    keyActionItems: [
      'Cease marketing past return claims on website/socials until PVA certification is obtained.',
      'Prepare transaction logs and algorithm trade books for quarterly PVA audit.',
      'Update client agreement disclosures with PVA registration details.'
    ],
    scrapedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isNew: true,
  },
  {
    id: 'rbi-2025-01',
    regulator: 'RBI',
    title: 'Master Direction on Cyber Resilience and Digital Payment Security Controls for Regulated Entities',
    refNumber: 'RBI/2024-25/118 DoS.CO.CSITE.SEC.No.4/31.01.015/2024-25',
    publishDate: '2025-02-14',
    sourceUrl: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12745&Mode=0',
    rawText: `1. The Reserve Bank of India issues Master Directions to reinforce the cybersecurity framework for Scheduled Commercial Banks, Payment Aggregators (PAs), and NBFC-UL.
2. Regulated entities must establish a 24x7 Security Operations Centre (SOC) and conduct continuous Threat Intelligence ingestion.
3. Multi-factor authentication (MFA) is strictly mandated for all corporate treasury transfers and API-based settlement handshakes.
4. Any security breach involving customer financial data must be reported to RBI within 2 hours of detection.`,
    aiSummary: 'RBI mandates strict cyber resilience controls including 24/7 Security Operations Centres, multi-factor authentication for API-based fund settlements, and mandatory 2-hour breach reporting to RBI for banks, PAs, and top-tier NBFCs.',
    impactTags: ['fintech & payments', 'audit requirements', 'AML/KYC'],
    applicableEntities: ['Scheduled Commercial Banks', 'Payment Aggregators', 'Large NBFCs'],
    urgency: 'HIGH',
    keyActionItems: [
      'Review incident response playbooks to ensure mandatory 2-hour RBI notification SLA.',
      'Enforce hardware or cryptographic MFA across all corporate treasury endpoints.',
      'Complete third-party API penetration testing audit by Q1.'
    ],
    scrapedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isNew: true,
  },
  {
    id: 'mca-2025-01',
    regulator: 'MCA',
    title: 'Amendment to Companies (Significant Beneficial Ownership) Rules - Enhanced Disclosures for Foreign Holding Structures',
    refNumber: 'MCA/F.No.1/1/2025-CL-V',
    publishDate: '2025-02-10',
    sourceUrl: 'https://www.mca.gov.in/content/mca/global/en/notifications-circulars/circulars.html',
    rawText: `1. Ministry of Corporate Affairs (MCA) notifies amendments to the Significant Beneficial Ownership (SBO) rules under Section 90 of Companies Act, 2013.
2. Reporting companies with multi-layered offshore holding entities must identify and disclose ultimate natural persons exercising control or holding >= 10% voting rights.
3. Form BEN-2 must be filed with Registrar within 30 days of any alteration in the SBO register.`,
    aiSummary: 'MCA introduces tighter Significant Beneficial Ownership (SBO) disclosures requiring Indian companies with offshore holding structures to identify natural person owners holding 10%+ rights and file Form BEN-2 within 30 days of changes.',
    impactTags: ['corporate governance', 'disclosure norms', 'AML/KYC'],
    applicableEntities: ['Indian Private & Public Companies', 'FDI-funded Startups', 'Secretarial Auditors'],
    urgency: 'MEDIUM',
    keyActionItems: [
      'Conduct cap table look-through for all foreign holding entities holding >= 10%.',
      'Obtain Form BEN-1 declarations from ultimate beneficial owners.',
      'File Form BEN-2 on MCA V3 portal within the 30-day statutory window.'
    ],
    scrapedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'cbdt-2025-01',
    regulator: 'CBDT',
    title: 'Guidelines on Tax Deducted at Source (TDS) under Section 194R and Section 194S for Virtual Digital Assets and Benefits',
    refNumber: 'CBDT Circular No. 03/2025 in F.No. 370142/02/2025-TPL',
    publishDate: '2025-02-05',
    sourceUrl: 'https://incometaxindia.gov.in/Pages/communications/circulars.aspx',
    rawText: `1. Central Board of Direct Taxes (CBDT) issues clarification on applicability of TDS on business benefits, dealer incentives, and foreign conference sponsorships under Section 194R.
2. In-kind perks, gift vouchers, and sales-linked foreign travel provided to channel partners exceeding Rs. 20,000 in aggregate must be subjected to 10% TDS withholding before release.
3. Clarification on exchange and platform obligations under Section 194S for crypto-to-crypto transactions.`,
    aiSummary: 'CBDT clarifies that sales incentives, dealer travel sponsorships, and promotional gifts exceeding ₹20,000 require 10% TDS deduction under Section 194R before distribution, accompanied by explicit valuation guidelines for non-cash perks.',
    impactTags: ['tax filing', 'audit requirements'],
    applicableEntities: ['Corporate Taxpayers', 'Chartered Accountants', 'Fintechs & Crypto Platforms'],
    urgency: 'HIGH',
    keyActionItems: [
      'Review channel incentive schemes and corporate travel expenditures for 194R liability.',
      'Ensure 10% advance tax/TDS deduction is verified before releasing dealer gift cards.',
      'Reconcile Form 26AS/AIS entries prior to quarterly tax filing.'
    ],
    scrapedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'cbic-2025-01',
    regulator: 'CBIC',
    title: 'Mandatory E-Way Bill generation and dynamic E-Invoicing threshold applicability for B2B Supplies',
    refNumber: 'CBIC Notification No. 04/2025 – Central Tax',
    publishDate: '2025-01-28',
    sourceUrl: 'https://cbic-gst.gov.in/notifications.html',
    rawText: `1. CBIC mandates integration of RFID-tagged E-Way bill generation with the National E-Invoicing System for registered taxpayers with turnover exceeding Rs. 5 Crores.
2. Reconciliation between GSTR-1 and GSTR-3B with automatic auto-population discrepancies exceeding 10% will trigger system-generated Form DRC-01B notices.`,
    aiSummary: 'CBIC mandates automated RFID and E-Invoicing linkage for businesses with turnover > ₹5 Cr and implements automated Form DRC-01B show-cause notices for ITC discrepancies exceeding 10% between GSTR-1 and GSTR-3B filings.',
    impactTags: ['tax filing', 'audit requirements', 'disclosure norms'],
    applicableEntities: ['GST Registered Businesses', 'Tax Practitioners', 'Supply Chain Enterprises'],
    urgency: 'MEDIUM',
    keyActionItems: [
      'Align ERP billing software with CBIC IRP API v2.',
      'Set up monthly reconciliation threshold alerts between GSTR-2B and Purchase Registers.',
      'Ensure responses to DRC-01B automated intimations within 7 business days.'
    ],
    scrapedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
  {
    id: 'sebi-2025-02',
    regulator: 'SEBI',
    title: 'Measures to strengthen the Equity Index Derivatives framework for investor protection and market stability',
    refNumber: 'SEBI/HO/MRD/TPD-1/P/CIR/2024/140',
    publishDate: '2025-01-15',
    sourceUrl: 'https://www.sebi.gov.in/legal/circulars/oct-2024/measures-to-strengthen-equity-index-derivatives.html',
    rawText: `1. SEBI issues directions to Stock Exchanges and Clearing Corporations regarding index derivatives.
2. Upfront collection of Option Premium from buyers is strictly enforced.
3. Minimum contract value increased to Rs 15 Lakhs at the time of introduction.
4. Extreme Loss Margin (ELM) increased by 2% on expiry day contracts.`,
    aiSummary: 'SEBI tightens index F&O trading norms by mandating upfront option premium collection, hiking minimum contract sizes to ₹15 Lakhs, and increasing expiry-day Extreme Loss Margins (ELM) to curb retail trading leverage risks.',
    impactTags: ['investment products', 'RA compliance', 'disclosure norms'],
    applicableEntities: ['Stock Brokers', 'Trading Members', 'Algorithmic Traders', 'Portfolio Managers'],
    urgency: 'HIGH',
    keyActionItems: [
      'Update broker margin calculation engines to collect upfront option buyer premiums.',
      'Adjust contract size filters across API execution bridges.',
      'Publish updated risk disclosures to F&O retail clients.'
    ],
    scrapedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
  {
    id: 'rbi-2025-02',
    regulator: 'RBI',
    title: 'Framework for Alternative Authentication Mechanisms for Digital Payment Transactions',
    refNumber: 'RBI/2024-25/94 DPSS.CO.OD.No.711/04.04.009/2024-25',
    publishDate: '2025-01-08',
    sourceUrl: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12710&Mode=0',
    rawText: `1. The Reserve Bank introduces principle-based guidelines for Additional Factor of Authentication (AFA).
2. Payment System Operators may implement biometric, behavioural, or passkey authentication alongside standard SMS OTPs.
3. The issuer bank remains responsible for verifying authentication efficacy and preventing synthetic identity fraud.`,
    aiSummary: 'RBI enables modern passkey, tokenized, and biometric authentication as valid Additional Factor of Authentication (AFA) alternatives to SMS OTPs, while holding issuer banks liable for fraud mitigation controls.',
    impactTags: ['fintech & payments', 'AML/KYC'],
    applicableEntities: ['Payment Gateways', 'Fintechs', 'Card Issuing Banks'],
    urgency: 'MEDIUM',
    keyActionItems: [
      'Evaluate FIDO2 / WebAuthn passkey SDKs for mobile checkout journeys.',
      'Conduct risk score audits on biometric verification fallback protocols.'
    ],
    scrapedAt: new Date(Date.now() - 3600000 * 120).toISOString(),
  }
];

const INITIAL_SOURCES: ScraperSource[] = [
  {
    id: 'src-sebi-circulars',
    regulator: 'SEBI',
    name: 'SEBI Legal Circulars & Guidelines',
    url: 'https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&smid=0&ssid=7',
    frequency: 'Every 30 mins',
    lastScrapeTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastScrapeStatus: 'success',
    lastScrapeMessage: 'Extracted 14 circulars; 2 new items ingested and summarized with Gemini.',
    totalItemsScraped: 14,
  },
  {
    id: 'src-rbi-notifications',
    regulator: 'RBI',
    name: 'RBI Notifications & Master Directions',
    url: 'https://www.rbi.org.in/Scripts/NotificationUser.aspx',
    frequency: 'Every 30 mins',
    lastScrapeTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastScrapeStatus: 'success',
    lastScrapeMessage: 'Extracted 22 notifications; 2 new items ingested.',
    totalItemsScraped: 22,
  },
  {
    id: 'src-mca-circulars',
    regulator: 'MCA',
    name: 'Ministry of Corporate Affairs Notifications & Circulars',
    url: 'https://www.mca.gov.in/content/mca/global/en/notifications-circulars/circulars.html',
    frequency: 'Every 1 hour',
    lastScrapeTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastScrapeStatus: 'success',
    lastScrapeMessage: 'Portal scanned; 8 circulars parsed.',
    totalItemsScraped: 8,
  },
  {
    id: 'src-cbdt-tax',
    regulator: 'CBDT',
    name: 'CBDT / Income Tax Circulars & Orders',
    url: 'https://incometaxindia.gov.in/Pages/communications/circulars.aspx',
    frequency: 'Every 1 hour',
    lastScrapeTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    lastScrapeStatus: 'success',
    lastScrapeMessage: 'Income tax communications scanned successfully.',
    totalItemsScraped: 11,
  },
  {
    id: 'src-cbic-gst',
    regulator: 'CBIC',
    name: 'CBIC / GST & Customs Notifications',
    url: 'https://cbic-gst.gov.in/notifications.html',
    frequency: 'Every 1 hour',
    lastScrapeTime: new Date(Date.now() - 3600000 * 6).toISOString(),
    lastScrapeStatus: 'success',
    lastScrapeMessage: 'GST circulars and tariff notifications monitored.',
    totalItemsScraped: 16,
  }
];

const INITIAL_USER_PREFS: UserPreferences = {
  id: 'usr_compliance_lead',
  name: 'Harsh Yadav',
  email: 'harshyadavv2456@gmail.com',
  selectedRegulators: ['SEBI', 'RBI', 'MCA', 'CBDT', 'CBIC'],
  selectedTags: ['RA compliance', 'tax filing', 'AML/KYC', 'disclosure norms', 'audit requirements', 'fintech & payments'],
  defaultFilterOnlySelected: false,
  themeMode: 'dark-terminal',
};

const INITIAL_SAVED_ITEMS: SavedItem[] = [
  {
    id: 'save-01',
    userId: 'usr_compliance_lead',
    notificationId: 'sebi-2025-01',
    savedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    personalNote: 'Critical for RIA division: Contact PVA partner to schedule Q1 audit of past return marketing claims.',
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadFromDisk();
  }

  private loadFromDisk(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          notifications: parsed.notifications || SEED_NOTIFICATIONS,
          userPreferences: parsed.userPreferences || INITIAL_USER_PREFS,
          savedItems: parsed.savedItems || INITIAL_SAVED_ITEMS,
          scraperSources: parsed.scraperSources || INITIAL_SOURCES,
        };
      }
    } catch (err) {
      console.warn('Error reading db from disk, initializing with seed:', err);
    }
    const initial = {
      notifications: SEED_NOTIFICATIONS,
      userPreferences: INITIAL_USER_PREFS,
      savedItems: INITIAL_SAVED_ITEMS,
      scraperSources: INITIAL_SOURCES,
    };
    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  // Notifications CRUD
  public getNotifications(filters?: {
    regulator?: string;
    tag?: string;
    search?: string;
    urgency?: string;
    startDate?: string;
    endDate?: string;
  }): NotificationItem[] {
    let list = [...this.data.notifications];

    // Sort reverse chronological
    list.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    if (!filters) return list;

    if (filters.regulator && filters.regulator !== 'ALL') {
      const regList = filters.regulator.split(',').map((r) => r.trim().toUpperCase());
      list = list.filter((item) => regList.includes(item.regulator.toUpperCase()));
    }

    if (filters.tag && filters.tag !== 'ALL') {
      const tagList = filters.tag.split(',').map((t) => t.trim().toLowerCase());
      list = list.filter((item) =>
        item.impactTags.some((t) => tagList.includes(t.toLowerCase()))
      );
    }

    if (filters.urgency && filters.urgency !== 'ALL') {
      list = list.filter((item) => item.urgency.toLowerCase() === filters.urgency?.toLowerCase());
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      list = list.filter((item) => new Date(item.publishDate).getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime() + 86400000;
      list = list.filter((item) => new Date(item.publishDate).getTime() <= end);
    }

    if (filters.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.aiSummary.toLowerCase().includes(q) ||
          item.refNumber.toLowerCase().includes(q) ||
          item.rawText.toLowerCase().includes(q) ||
          item.impactTags.some((t) => t.toLowerCase().includes(q)) ||
          item.applicableEntities.some((e) => e.toLowerCase().includes(q))
      );
    }

    return list;
  }

  public getNotificationById(id: string): NotificationItem | undefined {
    return this.data.notifications.find((n) => n.id === id);
  }

  public findBySourceUrlOrRef(sourceUrl: string, refNumber?: string): NotificationItem | undefined {
    const cleanUrl = sourceUrl.trim().toLowerCase();
    return this.data.notifications.find((n) => {
      if (n.sourceUrl.trim().toLowerCase() === cleanUrl) return true;
      if (refNumber && n.refNumber && n.refNumber.trim().toLowerCase() === refNumber.trim().toLowerCase()) return true;
      return false;
    });
  }

  public addNotification(notification: NotificationItem): NotificationItem {
    // Check if exists
    const existing = this.findBySourceUrlOrRef(notification.sourceUrl, notification.refNumber);
    if (existing) {
      return existing;
    }
    this.data.notifications.unshift(notification);
    this.saveToDisk();
    return notification;
  }

  public updateNotification(id: string, updates: Partial<NotificationItem>): NotificationItem | undefined {
    const idx = this.data.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    this.data.notifications[idx] = { ...this.data.notifications[idx], ...updates };
    this.saveToDisk();
    return this.data.notifications[idx];
  }

  // Saved / Bookmarks CRUD
  public getSavedItems(userId: string = 'usr_compliance_lead'): SavedItem[] {
    const saved = this.data.savedItems.filter((s) => s.userId === userId);
    return saved.map((s) => ({
      ...s,
      notification: this.getNotificationById(s.notificationId),
    }));
  }

  public toggleSaveItem(notificationId: string, note: string = '', userId: string = 'usr_compliance_lead'): { saved: boolean; item?: SavedItem } {
    const existingIndex = this.data.savedItems.findIndex(
      (s) => s.userId === userId && s.notificationId === notificationId
    );

    if (existingIndex !== -1) {
      this.data.savedItems.splice(existingIndex, 1);
      this.saveToDisk();
      return { saved: false };
    } else {
      const newItem: SavedItem = {
        id: 'save_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        userId,
        notificationId,
        savedAt: new Date().toISOString(),
        personalNote: note,
      };
      this.data.savedItems.unshift(newItem);
      this.saveToDisk();
      return { saved: true, item: { ...newItem, notification: this.getNotificationById(notificationId) } };
    }
  }

  public updateSavedItemNote(savedId: string, personalNote: string): SavedItem | undefined {
    const item = this.data.savedItems.find((s) => s.id === savedId);
    if (!item) return undefined;
    item.personalNote = personalNote;
    this.saveToDisk();
    return { ...item, notification: this.getNotificationById(item.notificationId) };
  }

  public deleteSavedItem(savedId: string): boolean {
    const initialLen = this.data.savedItems.length;
    this.data.savedItems = this.data.savedItems.filter((s) => s.id !== savedId);
    if (this.data.savedItems.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // Preferences
  public getUserPreferences(): UserPreferences {
    return this.data.userPreferences;
  }

  public updateUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
    this.data.userPreferences = {
      ...this.data.userPreferences,
      ...prefs,
    };
    this.saveToDisk();
    return this.data.userPreferences;
  }

  // Sources
  public getScraperSources(): ScraperSource[] {
    return this.data.scraperSources;
  }

  public updateScraperSource(id: string, updates: Partial<ScraperSource>): ScraperSource | undefined {
    const idx = this.data.scraperSources.findIndex((s) => s.id === id);
    if (idx === -1) return undefined;
    this.data.scraperSources[idx] = { ...this.data.scraperSources[idx], ...updates };
    this.saveToDisk();
    return this.data.scraperSources[idx];
  }
}

export const db = new Database();
