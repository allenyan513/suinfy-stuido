import {ChatPromptTemplate} from '@langchain/core/prompts';
import {StringOutputParser} from '@langchain/core/output_parsers';
import {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {SummaryService} from '../summaryService';

import {
  getCompressTextPrompt, getSummaryPrompt,
  getYouTubeKeyInsightPrompt,
  SYSTEM_PROMPT
} from "../../../common/const/prompts"

export default class SummaryServiceImpl implements SummaryService {

  async summary(chatModel: BaseChatModel,
                text: string,
                defaultLanguage: string,
                // onProgress: (progress: number) => void
  ): Promise<VideoSummaryVo> {
    console.log('generateKeyInsightByAI')
    if (text == null || text.length == 0) {
      return null
    }
    const totalLength = text.length
    try {
      //将subtitleWithTimestamp拆分成多个chunk，每个chunk的长度为 24000
      const MAX_LENGTH_ONE_TIME = 24000 // 约等于30分钟视频
      if (totalLength < MAX_LENGTH_ONE_TIME * 2) {
        return await this.generateKeyInsightByAIChunk(chatModel, text, defaultLanguage)
      } else {
        // 压缩率 = 24000 / totalLength
        const compressRate = MAX_LENGTH_ONE_TIME / totalLength
        const compressLength = Math.ceil(MAX_LENGTH_ONE_TIME * compressRate)
        const chunks: string[] = []
        for (let i = 0; i < totalLength; i += compressLength) {
          chunks.push(text.substring(i, i + compressLength))
        }
        // console.log('Compress Process. compressRate', compressRate, 'compressLength', compressLength, 'chunks', chunks.length)
        const compressedTexts = await Promise.all(
          chunks.map(chunk => this.compressText(chatModel, chunk, compressLength))
        )
        const compressedText = compressedTexts.join(' ')
        // console.log('Compress Process. compressedText', compressedText)
        return await this.generateKeyInsightByAIChunk(chatModel, compressedText, defaultLanguage)
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }


  private async generateKeyInsightByAIChunk(
    chatModel: BaseChatModel,
    text: string,
    defaultLanguage: string) {
    try {
      console.log('generateKeyInsightByAIChunk. text:', text.length, 'defaultLanguage:', defaultLanguage)
      const output = await ChatPromptTemplate.fromMessages([
          ['system', SYSTEM_PROMPT],
          ['user', '{input}']
        ])
          .pipe(chatModel)
          .pipe(new StringOutputParser())
          .invoke({
            // input: getYouTubeKeyInsightPrompt(text, defaultLanguage)
            input: getSummaryPrompt("", text)
          })
      ;
      // const filtered = (rawStringOutput as string).replace('```json', '').replace('```', '')
      // const jsonObject = JSON.parse(filtered);
      // console.log(jsonObject)
      // const keyInsightsWithOutEmoji= jsonObject.keyInsights as string[]
      console.log('generateKeyInsightByAIChunk. output:', output)
      return {
        summary: output,
      }
    } catch (e) {
      console.error(e)
      return null
    }
  }

  private async compressText(chatModel: BaseChatModel, text: string, targetLength: number) {
    try {
      console.log('compressText. text:', text.length, 'targetLength:', targetLength)
      const rawStringOutput = await ChatPromptTemplate.fromMessages([
        ['system', SYSTEM_PROMPT],
        ['user', '{input}']
      ])
        .pipe(chatModel)
        .pipe(new StringOutputParser())
        .invoke({
          input: getCompressTextPrompt(text, targetLength)
        });
      return rawStringOutput
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
