import {app} from "electron";
import fs from "fs";
import path from "path";


export function getDownloadPath() {
  const downloadPath = path.join(app.getPath('userData'), 'downloads')
  if (!fs.existsSync(downloadPath)) {
    fs.mkdirSync(downloadPath)
  }
  //replace blank space to \blan
  return downloadPath
}


export function getModelsPath() {
  const modelsPath = path.join(app.getPath('userData'), 'models')
  if (!fs.existsSync(modelsPath)) {
    fs.mkdirSync(modelsPath)
  }
  return modelsPath
}

export function getDatabasePath() {
  const dbPath = path.join(app.getPath('userData'), 'databases')
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath)
  }
  return dbPath
}

