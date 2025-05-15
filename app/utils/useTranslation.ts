import { translations } from './i18n';

type Path = string[];

function getNestedValue(obj: any, path: Path): string {
  return path.reduce((acc, key) => acc?.[key], obj) as string;
}

export function useTranslation() {
  const t = (key: string): string => {
    const path = key.split('.');
    const value = getNestedValue(translations, path);
    
    if (!value) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    return value;
  };

  return { t };
} 