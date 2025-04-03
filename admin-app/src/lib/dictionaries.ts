// Import dictionary types from child components
import type { FiltersDictionary } from '@/components/Filters';
import type { TimeReportDictionary } from '@/components/TimeReport';
import type { ChartsDictionary } from '@/components/Charts';
import type { ExportButtonDictionary } from '@/components/ExportButton';
// Remove unused import: import type { AdminPanelWrapperDictionary } from '@/components/AdminPanelWrapper';

// Define the detailed structure matching LandingPageContentDictionary and other potential pages
// This should encompass all strings used across the application that need translation.
// We'll start by incorporating the LandingPageContent structure.
export interface Dictionary { // Add export keyword
  // Properties directly from LandingPageContentDictionary
  title: string; // Assuming this is the overall app title, used in LandingPageContent
  description: string; // Assuming this is the main description, used in LandingPageContent
  signIn: string;
  getStarted: string;
  nav: {
    features: string;
    pricing: string;
    faq: string;
  };
  hero: {
    tagline: string;
    title1: string;
    title2: string;
    buttonFree: string;
    buttonLearn: string;
    imageAlt: string;
  };
  features: {
    title: string;
    description: string;
    card1: { title: string; description: string; item1: string; item2: string; item3: string; };
    card2: { title: string; description: string; item1: string; item2: string; item3: string; };
    card3: { title: string; description: string; item1: string; item2: string; item3: string; };
    card4: { title: string; description: string; item1: string; item2: string; item3: string; };
    card5: { title: string; description: string; item1: string; item2: string; item3: string; };
    card6: { title: string; description: string; item1: string; item2: string; item3: string; };
  };
  pricing: {
    title: string;
    description: string;
    free: { title: string; price: string; description: string; item1: string; item2: string; item3: string; item4: string; button: string; };
    pro: { badge: string; title: string; price: string; description: string; item1: string; item2: string; item3: string; item4: string; item5: string; button: string; };
    enterprise: { title: string; price: string; description: string; item1: string; item2: string; item3: string; item4: string; item5: string; button: string; };
  };
  faq: {
    title: string;
    description: string;
    item1: { question: string; answer: string; };
    item2: { question: string; answer: string; };
    item3: { question: string; answer: string; };
    item4: { question: string; answer: string; };
    item5: { question: string; answer: string; };
  };
  footer: {
    description: string;
    product: { title: string; features: string; pricing: string; faq: string; };
    company: { title: string; about: string; blog: string; contact: string; };
    support: { title: string; docs: string; help: string; status: string; };
    copyright: string;
    privacy: string;
    terms: string;
  };

  // Remove the separate landingPage key as its content is now at the top level
  // landingPage: {
  //   title: string;
  //   description: string;
  //   signIn: string;
  //   getStarted: string;
  // };
  dashboard: {
    title: string;
    selectBoard: string;
    loadingBoards: string;
    noBoards: string;
    generateReport: string;
    export: string;
    filters: string;
    dateRange: string;
    startDate: string;
    endDate: string;
    timeReport: string;
    loadingData: string;
    noData: string;
    totalTime: string;
    charts: string;
    // Add nested structures for dashboard sections
    filtersSection: FiltersDictionary;
    timeReportSection: TimeReportDictionary;
    chartsSection: ChartsDictionary;
    exportButtonSection: ExportButtonDictionary; // Add section for export button strings
    // Add keys from AdminPanelWrapperDictionary (board select, errors etc.)
    boardSelectLabel: string;
    boardSelectPlaceholder: string;
    boardSelectError: string;
    boardSelectLoading: string;
    boardSelectRetry: string;
    boardSelectNoBoardsFound: string;
    boardSelectNoBoardsAccess: string;
    boardSelectActiveBoardsLabel: string;
    boardSelectClosedBoardsLabel: string;
    boardSelectNoActiveBoards: string;
    errorLoadingBoards: string;
    errorFetchingTimeData: string;
    noEntriesFound: string;
  };
  header: {
    dashboard: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
  };
  common: {
    loading: string;
    error: string;
  };
  // Add toast messages here
  toast: {
    loggedOutTitle: string;
    loggedOutDescription: string;
  }
}

// Directly import the Polish dictionary
const loadPolishDictionary = () => import('@/dictionaries/pl.json').then((module) => module.default);

// Function to get the dictionary (always returns Polish)
export const getDictionary = async (): Promise<Dictionary> => {
  return loadPolishDictionary();
};

// Define the default locale (now always Polish)
export const defaultLocale = 'pl';

// Remove unused exports related to multiple locales
// export const locales = ['en', 'pl'];
