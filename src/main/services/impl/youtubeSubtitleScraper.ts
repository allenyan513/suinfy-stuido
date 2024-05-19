/* @flow */

import he from 'he';
import axios from 'axios';
import striptags from 'striptags';

const fetchData =
  typeof fetch === 'function'
    ? async function fetchData(url: string | URL | Request) {
      const response = await fetch(url);
      return await response.text();
    }
    : async function fetchData(url: string) {
      const {data} = await axios.get(url);
      return data;
    };

export async function getSubtitles({videoID}: { videoID: string }) {
  const data = await fetchData(`https://youtube.com/watch?v=${videoID}`);

  // * ensure we have access to captions data
  if (!data.includes('captionTracks')) {
    throw new Error(`Could not find captions for video: ${videoID}`);
  }

  const regex = /"captionTracks":(\[.*?\])/;
  const [match] = regex.exec(data);
  const {captionTracks} = JSON.parse(`{${match}}`);
  // eslint-disable-next-line no-console
  // console.log('captionTracks', captionTracks);

  if (
    !captionTracks ||
    !captionTracks.length ||
    captionTracks.length === 0 ||
    !captionTracks[0].baseUrl ||
    !captionTracks[0].languageCode
  ) {
    throw new Error(`Could not find captions for video: ${videoID}`);
  }

  const baseUrl = captionTracks[0].baseUrl;
  const languageCode = captionTracks[0].languageCode;

  // const subtitle =
  //   find(captionTracks, {
  //     vssId: `.${lang}`,
  //   }) ||
  //   find(captionTracks, {
  //     vssId: `a.${lang}`,
  //   }) ||
  //   find(captionTracks, ({ vssId }) => vssId && vssId.match(`.${lang}`));
  //
  // // * ensure we have found the correct subtitle lang
  // if (!subtitle || (subtitle && !subtitle.baseUrl))
  //   throw new Error(`Could not find ${lang} captions for ${videoID}`);
  // const transcript = await fetchData(subtitle.baseUrl);

  const transcript = await fetchData(baseUrl);
  const lines = transcript
    .replace('<?xml version="1.0" encoding="utf-8" ?><transcript>', '')
    .replace('</transcript>', '')
    .split('</text>')
    .filter((line: string) => line && line.trim())
    .map((line: string) => {
      const startRegex = /start="([\d.]+)"/;
      const durRegex = /dur="([\d.]+)"/;

      const [, start] = startRegex.exec(line);
      const [, dur] = durRegex.exec(line);

      const htmlText = line
        .replace(/<text.+>/, '')
        .replace(/&amp;/gi, '&')
        .replace(/<\/?[^>]+(>|$)/g, '');

      const decodedText = he.decode(htmlText);
      const text = striptags(decodedText);

      return {
        start,
        dur,
        text,
      };
    });

  return {
    videoID,
    lang: languageCode,
    lines,
  };

}
