import dbHelper from "./dbHelper";

const TABLE_NAME = 'videoSubtitle'
const videoSubtitleDao = {

  createTable() {
    dbHelper.db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    videoId INTEGER NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT '',
    srtPath TEXT NOT NULL DEFAULT ''
    )`, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log('Create videoSubtitle table success')
    })
  },

  async insert(videoSubtitle: VideoSubtitleEntity): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      dbHelper.db.run(`INSERT INTO ${TABLE_NAME} (videoId, language, srtPath) VALUES (?, ?, ?)`,
        [videoSubtitle.videoId, videoSubtitle.language, videoSubtitle.srtPath], function (err: any) {
          if (err) {
            reject(err)
          } else {
            resolve(this.lastID)
          }
        })
    })
  },

  async findByVideo(videoId: number): Promise<VideoSubtitleEntity[]> {
    return new Promise<VideoSubtitleEntity[]>((resolve, reject) => {
      dbHelper.db.all(`SELECT * FROM ${TABLE_NAME} WHERE videoId = ?`,
        [videoId],
        (err: any, rows: VideoSubtitleEntity[]) => {
          if (err) {
            reject(err)
          } else {
            resolve(rows)
          }
        })
    })
  },

  async findByVideoIdAndLanguage(videoId: number, language: string): Promise<VideoSubtitleEntity> {
    return new Promise<VideoSubtitleEntity>((resolve, reject) => {
      dbHelper.db.get(`SELECT * FROM ${TABLE_NAME} WHERE videoId = ? and language = ?`,
        [videoId, language],
        (err: any, row: VideoSubtitleEntity) => {
          if (err) {
            reject(err)
          } else if (!row) {
            resolve(null)
          } else {
            resolve(row)
          }
        })
    })
  },


  async update(id: number, keyValues: any) {
    return new Promise<number>((resolve, reject) => {
      const keys = Object.keys(keyValues)
      const values = Object.values(keyValues)
      const setClause = keys.map((key) => `${key} = ?`).join(',')
      const sql = `UPDATE ${TABLE_NAME} SET ${setClause} WHERE id = ?`
      dbHelper.db.run(sql, [...values, id], (err: any) => {
        if (err) {
          reject(err)
        } else {
          resolve(1)
        }
      })
    })
  }
}
export default videoSubtitleDao
