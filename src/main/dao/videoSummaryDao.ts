import dbHelper from "./dbHelper";


const TABLE_NAME = 'videoSummary'
const videoSummaryDao = {

  createTable() {
    dbHelper.db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    videoId INTEGER NOT NULL DEFAULT '',
    language TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    taskStatus TEXT NOT NULL DEFAULT 'processing',
    error TEXT NOT NULL DEFAULT '',
    unique(videoId, language)
    )`, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log(`Create ${TABLE_NAME} table success`)
    })
  },

  async insert(videoSummaryEntity: VideoSummaryEntity): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      dbHelper.db.run(`INSERT INTO ${TABLE_NAME} (videoId, language, summary, taskStatus,error) VALUES (?, ?, ?, ?, ?)`,
        [videoSummaryEntity.videoId, videoSummaryEntity.language, videoSummaryEntity.summary, videoSummaryEntity.taskStatus, videoSummaryEntity.error], function (err: any) {
          if (err) {
            reject(err)
          } else {
            resolve(this.lastID)
          }
        })
    })
  },

  async findByVideoIdAndLanguage(videoId: number, language: string): Promise<VideoSummaryEntity> {
    return new Promise<VideoSummaryEntity>((resolve, reject) => {
      dbHelper.db.get(`SELECT * FROM ${TABLE_NAME} WHERE videoId = ? and language = ?`,
        [videoId, language],
        (err: any, row: VideoSummaryEntity) => {
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
        }
        resolve(1)
      })
    })
  }

}
export default videoSummaryDao
