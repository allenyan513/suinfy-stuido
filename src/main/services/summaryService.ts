import {BaseChatModel} from "@langchain/core/language_models/chat_models";
import SummaryServiceImpl from "./impl/summaryServiceImpl";

export interface SummaryService {
  summary(chatModel: BaseChatModel, text: string, defaultLanguage: string): Promise<VideoSummaryVo>
}
const summaryService = new SummaryServiceImpl();
export default summaryService;
