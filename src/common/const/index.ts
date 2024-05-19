export const TASK_STATUS = {
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  ERROR: 'error',
}
export const BIZ_ERROR = {
  NO_CREDENTIALS: {
    code: 600,
    msg: 'No credentials'
  },
  NO_ACCESS: {
    code: 601,
    msg: 'Free trial has expired, please subscribe'
  },
}

export const API = {
  SEARCH: 'search',
  PROCESS: 'process',
  GET_VIDEO_INFO: 'get-video-info',
  EXTRACT_AUDIO: 'extract-audio',
  DOWNLOAD_VIDEO: 'download-video',
  SPEECH_TO_TEXT: 'speech-to-text',
}

export const TASK_TYPE = {
  SUMMARY: 'summary',
  KEY_INSIGHT: 'keyinsight',
}

export const WHISPER_MODELS = {
  TINY: {
    name: 'Tiny',
    value: 'ggml-tiny.bin'
  },
  BASE: {
    name: 'Base',
    value: 'ggml-base.bin'
  },
  SMALL: {
    name: 'Small',
    value: 'ggml-small.bin'
  },
  MEDIUM: {
    name: 'Medium',
    value: 'ggml-medium.bin'
  },
  LARGE_V1: {
    name: 'LargeV1',
    value: 'ggml-large-v1.bin'
  },
}
export function convertValueToName(value: string) {
  switch (value) {
    case WHISPER_MODELS.TINY.value:
      return WHISPER_MODELS.TINY.name
    case WHISPER_MODELS.BASE.value:
      return WHISPER_MODELS.BASE.name
    case WHISPER_MODELS.SMALL.value:
      return WHISPER_MODELS.SMALL.name
    case WHISPER_MODELS.MEDIUM.value:
      return WHISPER_MODELS.MEDIUM.name
    case WHISPER_MODELS.LARGE_V1.value:
      return WHISPER_MODELS.LARGE_V1.name
  }
}

export const COLLAPSE_HEIGHT = 66;
export const MIN_HEIGHT = 170;
export const MAX_HEIGHT = 600;

export const TIER = {
  FREE: 'FREE',
  PRO: 'PRO',
}


