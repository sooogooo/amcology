export interface ReadingHistoryItem {
  articleId: number;
  scrollY: number;
  progressPercent: number;
  timestamp: number;
  articleTitle: string;
}

const STORAGE_KEY = 'amcology_reading_history_v1';

export function saveReadingProgress(articleId: number, scrollY: number, progressPercent: number, articleTitle: string) {
  try {
    const data: ReadingHistoryItem = {
      articleId,
      scrollY,
      progressPercent,
      timestamp: Date.now(),
      articleTitle,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save reading progress to localStorage', e);
  }
}

export function getSavedReadingProgress(): ReadingHistoryItem | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.articleId === 'number' && typeof parsed.scrollY === 'number') {
      return parsed as ReadingHistoryItem;
    }
  } catch (e) {
    console.warn('Failed to read reading progress from localStorage', e);
  }
  return null;
}

export function clearReadingProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear reading progress', e);
  }
}
