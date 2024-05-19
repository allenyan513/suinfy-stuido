export const SYSTEM_PROMPT = 'You are an expert in summarizing key ideas from text.'


export const getCompressTextPrompt = (text: string, targetLength: number) => {
  return `
  Remove redundant information, retain important information from the following text to ${targetLength} characters:
  
  ${text}
  `
}

export const getYouTubeKeyInsightPrompt = (subtitle: string, defaultLanguage: string) => {
  return `
  Generate summary and key insights by the following subtitle text , return in ${defaultLanguage} language:
  
  Subtitle Text:  
  ${subtitle}
  
  return JSONObject format like:
  {
  "summary":string
  "keyInsights":[
    {
      "emoji":string,
      "text":string
    }
  ]
  }
  
  result: 
  `
}

export const getSummaryPrompt = (title: string, transcript: string) => {
  return `
Your output should use the following template:

### Summary

### Notes

- [Emoji] Bulletpoint

### Keywords

- Explanation

You have been tasked with creating a concise summary of a YouTube video using its transcription.

Make a summary of the transcript.

Additionally make a short complex analogy to give context and/or analogy from day-to-day life from the transcript.

Create 10 bullet points (each with an appropriate emoji) that summarize the key points or important moments from the video's transcription.

In addition to the bullet points, extract the most important keywords and any complex words not known to the average reader aswell as any acronyms mentioned. For each keyword and complex word, provide an explanation and definition based on its occurrence in the transcription.

Please ensure that the summary, bullet points, and explanations fit within the 330-word limit, while still offering a comprehensive and clear understanding of the video's content. Use the text above: 
${title} 
${transcript}. "
  `
}

export const getYouTubeSummaryPrompt = (subtitle: string, defaultLanguage: string) => {
  return `
  Summarize main key idea, sub key ideas and a emoji from the following subtitle text in ${defaultLanguage} language:
  
  Subtitle Text:  
  ${subtitle}
  
  return JSONObject format like:
  {
  "main_key_idea":"",
  "sub_key_ideas":["", ""],
  "emoji":"",
  }
  result: 
  `
}
