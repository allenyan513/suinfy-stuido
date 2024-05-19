import {TranslationServiceClient} from '@google-cloud/translate';

const MAX_TEXT_ROWS = 256;

export default class GoogleCloudTranslateService {
  translationServiceClient: TranslationServiceClient;
  projectId: string;
  location: string;

  constructor() {
    this.translationServiceClient = new TranslationServiceClient();
    this.projectId = `${process.env.GOOGLE_CLOUD_PROJECT_ID}`;
    this.location = 'global';
  }

  translateText = async (texts: string[], sourceLanguage: string , targetLanguage: string) => {
    console.log('translateText. length:', texts.length)
    if (texts.length > MAX_TEXT_ROWS) {
      //split texts
      // const results: string[][] = []
      // const length = texts.length
      // for (let i = 0; i < length; i += MAX_TEXT_ROWS) {
      //   const end = i + MAX_TEXT_ROWS
      //   const subTexts = texts.slice(i, end)
      //   const result = await this.translateTextBatch(subTexts, sourceLanguage, targetLanguage)
      //   results.push(result)
      // }
      // return results.flat()

      //为了节约成本 暂时只翻译前256个字
      return this.translateTextBatch(texts.slice(0, MAX_TEXT_ROWS), sourceLanguage, targetLanguage)
    } else {
      return this.translateTextBatch(texts, sourceLanguage, targetLanguage)
    }
  }

  translateTextBatch = async (texts: string[], sourceLanguage: string, targetLanguage: string) => {
    console.log('translateTextBatch. length:', texts.length)
    try {
      const _sourceLanguageCode = this.adapterLanguageCode(sourceLanguage)
      const _targetLanguageCode = this.adapterLanguageCode(targetLanguage)
      if (_sourceLanguageCode === _targetLanguageCode) {
        return texts
      }
      const request = {
        parent: `projects/${this.projectId}/locations/${this.location}`,
        contents: texts,
        mimeType: 'text/plain', // mime types: text/plain, text/html
        sourceLanguageCode: _sourceLanguageCode,
        targetLanguageCode: _targetLanguageCode,
      };
      const [response] = await this.translationServiceClient.translateText(request);
      if (response.translations) {
        return response.translations?.map((item) => {
          return item.translatedText || '';
        })
      }
      return []
    } catch (e) {
      console.error(e)
      return []
    }
  };

  adapterLanguageCode = (lang: string) => {
    if (lang === 'zh' ||
      lang === 'zh-Hans' ||
      lang === 'zh-CN'
    ) {
      return 'zh-CN'
    }
    return lang
  }
}
