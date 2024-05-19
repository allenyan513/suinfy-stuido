/**
 * 00:00:17,720 -> 00:01
 */
export const formatTimeStampShort = (start: string): string => {
  const time = start.split(',');
  return formatSubtitleTimeStampShort(time[0]);
}


/**
 * seconds -> 00:00:00
 */
export const formatTimeStamp = (seconds: number): string => {
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds - hour * 3600) / 60);
  const second = Math.floor(seconds - hour * 3600 - minute * 60);
  const result = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  return formatSubtitleTimeStampShort(result)
}


/**
 * 00:00:00 -> seconds
 */
export const formatSubtitleTimeStamp = (start: string): number => {
  const time = start.split(':');
  return parseInt(time[0]) * 3600 + parseInt(time[1]) * 60 + parseInt(time[2]);
}

/**
 * 00:00:01 -> 00:01
 * 01:00:01 -> 01:00:01
 */
export const formatSubtitleTimeStampShort = (start: string): string => {
  const time = start.split(':');
  if (parseInt(time[0]) === 0) {
    return `${time[1]}:${time[2]}`;
  }
  return start;
}


export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({length: totalPages}, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};


export function waitForElm(selector: any) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true, subtree: true,
    });
  });
}


export const replaceFile = (url: string) => {
  return url.replace('file://', 'media://')

}
