import dbHelper from "./dbHelper";


const TABLE_NAME = 'videoChannel'
const videoChannelDao = {

  createTable() {
    dbHelper.db.run(`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    channelId TEXT NOT NULL DEFAULT '',
    channelName TEXT NOT NULL DEFAULT '',
    channelAvatar TEXT NOT NULL DEFAULT ''
    )`, (err) => {
      if (err) {
        console.error(err.message)
      }
      console.log(`Create ${TABLE_NAME} table success`)
    })
  },

  async insert(entity: VideoChannelEntity): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      dbHelper.db.run(`INSERT INTO ${TABLE_NAME} (channelId, channelName, channelAvatar) VALUES (?, ?, ? )`,
        [entity.channelId, entity.channelName, entity.channelAvatar], function (err: any) {
          if (err) {
            reject(err)
          } else {
            resolve(this.lastID)
          }
        })
    })
  },


  async findByChannelId(channelId: string): Promise<VideoChannelEntity> {
    return new Promise<VideoChannelEntity>((resolve, reject) => {
      dbHelper.db.get(`SELECT * FROM ${TABLE_NAME} WHERE channelId = ?`,
        [channelId],
        (err: any, row: VideoChannelEntity) => {
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

  async findList(page: number, pageSize: number): Promise<VideoChannelEntity[]> {
    return new Promise<VideoChannelEntity[]>((resolve, reject) => {
      const sql = `SELECT * FROM ${TABLE_NAME} order by updated desc limit ? offset ?`
      const params = [pageSize, (page - 1) * pageSize]
      dbHelper.db.all(sql, params, (err: any, rows: VideoChannelEntity[]) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  },

  async delete(id: number) {
    return new Promise<number>((resolve, reject) => {
      dbHelper.db.run(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id], function (err: any) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes)
        }
      })
    })
  }

}
export default videoChannelDao
