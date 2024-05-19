// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scriptst


import {contextBridge, ipcMain, ipcRenderer, shell} from 'electron'
import {API} from "../common/const";

contextBridge.exposeInMainWorld(
  'electron',
  {
    openDevTools: () => ipcRenderer.send('open-dev-tools'),
    send: (channel: string, data: any) => {
      ipcRenderer.send(channel, data)
    },
    receive: (channel: string, func: (event: any, ...args: any[]) => void) => {
      ipcRenderer.removeAllListeners(channel)
      ipcRenderer.on(channel, (event, ...args) => func(event, ...args))
    },
    invoke: async (channel: string, ...args: any[]) => {
      return await ipcRenderer.invoke(channel, ...args)
    },
  }
)

contextBridge.exposeInMainWorld(
  "api",
  {
    getVideoInfo: async (videoId: string) => {
      return await ipcRenderer.invoke(API.GET_VIDEO_INFO, videoId)
    },
    onProgress: (callback: (args: any) => void) => {
      ipcRenderer.on('onProgress', (event, args) => {
        callback(args)
      })
    },
    onReceiveSubtitle: (callback: (args: any) => void) => {
      ipcRenderer.on('onReceiveSubtitle', (event, args) => {
        callback(args)
      })
    },
  }
)
