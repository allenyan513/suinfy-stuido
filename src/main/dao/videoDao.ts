import dbHelper from "./dbHelper";


const TABLE_NAME = 'video'
const videoDao = {

  createTable() {
    dbHelper.db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    url TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    videoPath TEXT NOT NULL DEFAULT '',
    audioPath TEXT NOT NULL DEFAULT '',
    srtPath TEXT NOT NULL DEFAULT '',
    title TEXT NOT NULL DEFAULT '',
    author TEXT NOT NULL DEFAULT '',
    thumbnail TEXT NOT NULL DEFAULT '',
    channelId TEXT NOT NULL DEFAULT '',
    defaultLanguage TEXT NOT NULL DEFAULT ''
    )`, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log('Create video table success')
    })
  },

  async insert(video: VideoEntity): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      dbHelper.db.run(`INSERT INTO ${TABLE_NAME} (url, source, videoPath, audioPath,srtPath, title, author, thumbnail, channelId,defaultLanguage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [video.url, video.source, video.videoPath, video.audioPath, video.srtPath, video.title, video.author, video.thumbnail, video.channelId, video.defaultLanguage], function (err: any) {
          if (err) {
            reject(err)
          } else {
            console.log('insert video success', this.lastID)
            resolve(this.lastID)
          }
        })
    })
  },

  async findByUrl(url: string): Promise<VideoEntity> {
    return new Promise<VideoEntity>((resolve, reject) => {
      dbHelper.db.get(`SELECT * FROM ${TABLE_NAME} WHERE url = ?`, [url], (err: any, row: VideoEntity) => {
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

  async get(id: number): Promise<VideoEntity> {
    return new Promise<VideoEntity>((resolve, reject) => {
      dbHelper.db.get(`SELECT * FROM ${TABLE_NAME} WHERE id = ?`, [id], (err: any, row: VideoEntity) => {
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

  async findList(page: number, pageSize: number): Promise<VideoEntity[]> {
    return new Promise<VideoEntity[]>((resolve, reject) => {
      const sql = `SELECT * FROM ${TABLE_NAME} order by updated desc limit ? offset ?`
      const params = [pageSize, (page - 1) * pageSize]
      dbHelper.db.all(sql, params, (err: any, rows: VideoEntity[]) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
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
export default videoDao
