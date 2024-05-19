import sqlite3 from "sqlite3";
import {getDatabasePath} from "../utils";
import path from "path";
import videoSubtitleDao from "./videoSubtitleDao";
import videoDao from "./videoDao";
import videoSummaryDao from "./videoSummaryDao";
import videoChannelDao from "./videoChannelDao";

class DbHelper {

  db: sqlite3.Database

  init() {
    const dbPath = path.join(getDatabasePath(), 'suinfy.db')
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log('Connected to the database.')
    })
    this.createTable()
  }

  createTable() {
    if (!this.db) {
      console.error('Database is not open')
      return
    }
    videoDao.createTable()
    videoSubtitleDao.createTable()
    videoSummaryDao.createTable()
    videoChannelDao.createTable()
  }

  close() {
    if (!this.db) {
      console.error('Database is not open')
      return
    }
    this.db.close((err) => {
      if (err) {
        console.error(err.message)
      }
      console.log('Close the database connection.')
    })

  }
}


const dbHelper = new DbHelper()
export default dbHelper;
