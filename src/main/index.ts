import './loadEnv'
import {app, BrowserWindow, session, ipcMain, protocol, net, dialog, shell} from 'electron';
import {API} from "../common/const";
import youtubeService from "./services/youtubeService";
import videoService from "./services/videoService";
import dbHelper from "./dao/dbHelper";
import translationService from "./services/translationService";
import llmService from "./services/llmService";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
console.log('MAIN_WINDOW_WEBPACK_ENTRY', MAIN_WINDOW_WEBPACK_ENTRY)

let isRegistered = false
let mainWindow: BrowserWindow | null = null

function registerAPI() {
  if (isRegistered) return
  isRegistered = true
  ipcMain.handle("prepare", async (event, inputValue) => {
    return videoService.prepare(inputValue);
  })
  ipcMain.handle("startTask", async (event, taskOptions) => {
    return videoService.startTask(event, taskOptions)
  })
  ipcMain.handle("getTranslatedSubtitles", async (event, videoId, from, to) => {
    return videoService.getTranslatedSubtitles(event, videoId, from, to)
  })
  ipcMain.handle("getVideo", async (event, videoId) => {
    return videoService.getVideo(videoId)
  })
  ipcMain.handle('export', async (event, options) => {
    return videoService.export(event, options)
  })
  ipcMain.handle('getSummary', async (event, options) => {
    return videoService.getSummary(options.videoId)
  })
  ipcMain.handle('getTranslatedSummary', async (event, options) => {
    return videoService.getTranslatedSummary(options.videoId, options.defaultLanguage, options.targetLanguage)
  })
  ipcMain.handle('getList', async (event, page: number, pageSize: number) => {
    return videoService.getList(page, pageSize)
  })
  ipcMain.handle(API.GET_VIDEO_INFO, async (event, videoId) => {
    return youtubeService.fetchYouTubeMeta(videoId)
  })

  ipcMain.handle("open-dev-tools", async (event) => {
    event.sender.openDevTools()
  })
  ipcMain.handle("translate", async (event, model, text, from, to) => {
    return translationService.translate(text, from, to)
  })
  ipcMain.handle('openDialog', async (event, options) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    }).then((result) => {
      event.sender.send('selectedFiles', result.filePaths)
    })
  })
  ipcMain.handle('getChannels', async (event, pageToken) => {
    return youtubeService.getMySubscribers(pageToken)
  })
  ipcMain.handle('getChannelVideos', async (event, channelId, pageToken) => {
    return youtubeService.getLatestVideos(channelId, pageToken)
  })

  ipcMain.handle('getAuthorizationUrl', async (event) => {
    return youtubeService.getAuthorizationUrl()
  })

  ipcMain.handle('openUrl', async (event, url) => {
    return shell.openExternal(url)
  })
  ipcMain.handle('summaryByDate', async (event, date) => {
    return youtubeService.summaryByDate(date)
  })
}


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
    }
  }
])

const createWindow = (): void => {
  // Create the browser window.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          // 'default-src \'self\'',
          // 'script-src \'self\' https://googleads.g.doubleclick.net',
          // 'img-src \'self\' https://www.youtube.com https://i.ytimg.com',
          'media-src \'self\' blob: https://www.youtube.com https://i.ytimg.com',
        ]
      }
    })
  })
  ;
  // protocol.handle("media", (req: GlobalRequest) => {
  //   return net.fetch('file://' + req.url.slice('media://'.length));
  // })
  protocol.registerFileProtocol("media", (request, callback) => {
    const url = request.url.replace("media://", "");
    try {
      return callback(url);
    } catch (err) {
      console.error(err);
      return callback('404');
    }
  });

  mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
    titleBarStyle: 'hidden',
    // titleBarOverlay: true,
    // frame: false,
    // icon: path.join(__dirname, 'public/icon.png'),
    icon: '/Users/alin/75_suinfy/suinfy-desktop/public/icon',
    title: 'Suinfy',
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  llmService.startServer().then(() => {
    console.log('ollama server started')
  })
  registerAPI()
  dbHelper.init()
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('open-url', (event, url) => {
  console.log('open-url', url)
  if (url.startsWith('suinfy://oauth2callback')) {
    const code = new URL(url).searchParams.get('code')
    youtubeService.handleAuthCallback(code).then(() => {
      console.log('auth success')
    })
  }
})
app.setAsDefaultProtocolClient('suinfy')

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
