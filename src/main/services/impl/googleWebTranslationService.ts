import {TranslationService} from "../translationService";
import translate from '@iamtraction/google-translate'

export default class GoogleWebTranslationService implements TranslationService {
  async translate(text: string, sourceLanguage: string, targetLanguage: string): Promise<string | null> {
    try {
      const result = await translate(text,
        {
          to: targetLanguage
        }
      )
      return result.text
    } catch (e) {
      return null
    }
  }

  async translateBatch(texts: string[], sourceLanguage: string, targetLanguage: string): Promise<string[] | null> {
    throw new Error('Method not implemented.')
  }
}
