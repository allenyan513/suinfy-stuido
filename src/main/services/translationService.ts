import GoogleWebTranslationService from "./impl/googleWebTranslationService";
import GoogleCloudTranslateService from "./impl/googleCloudTranslateService";

export interface TranslationService {
  translate(texts: string, sourceLanguage: string, targetLanguage: string): Promise<string>

  translateBatch(texts: string[], sourceLanguage: string, targetLanguage: string): Promise<string[]>
}

const translationService = new GoogleWebTranslationService()
const translateService = new GoogleCloudTranslateService();
export default translationService


