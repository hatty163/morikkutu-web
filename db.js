/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * 볕뉘 수정사항:
 * var 에서 let/const 로 변수 변경
 * Redis 설정 변경
 * kkutu-lib 모듈에 호환되도록 수정
 */

const LANG = [ 'ko', 'en' ]

const PgPool = require('pg').Pool
const GLOBAL = require('./global.json')
const lib = require('kkutu-lib')
const JLog = lib.jjlog
const Collection = lib.collection
const Pub = lib.checkpub

Pub.ready = function (isPub) {
  let redisConfig = {
    host: GLOBAL.REDIS_ADDR,
    port: GLOBAL.REDIS_PORT,
    password: GLOBAL.REDIS_PASS,
    db: GLOBAL.REDIS_GAME_DB
  }
  if (redisConfig.password === '') {
    delete redisConfig.password
  }
  const Redis = require('redis').createClient(redisConfig)
  const Pg = new PgPool({
    user: GLOBAL.PG_USER,
    password: GLOBAL.PG_PASS,
    port: GLOBAL.PG_PORT,
    database: GLOBAL.PG_DB,
    host: GLOBAL.PG_ADDR
  })
  Redis.on('connect', function () {
    connectPg()
  })
  Redis.on('error', function (err) {
    JLog.error('Error from Redis: ' + err)
  })
  function connectPg (noRedis) {
    Pg.connect(function (err, pgMain) {
      if (err) {
        JLog.error('Error when connect to PostgreSQL server: ' + err.toString())
        return
      }
      let redisAgent = noRedis ? null : new Collection.Agent('Redis', Redis)
      let mainAgent = new Collection.Agent('Postgres', pgMain)

      let DB = exports

      DB.kkutu = {}
      DB.kkutu_cw = {}
      DB.kkutu_manner = {}

      DB.redis = new redisAgent.Table('KKuTu_Score')
      for (let i in LANG) {
        DB.kkutu[LANG[i]] = new mainAgent.Table('kkutu_' + LANG[i])
        DB.kkutu_cw[LANG[i]] = new mainAgent.Table('kkutu_cw_' + LANG[i])
        DB.kkutu_manner[LANG[i]] = new mainAgent.Table('kkutu_manner_' + LANG[i])
      }
      DB.kkutu_injeong = new mainAgent.Table('kkutu_injeong')
      DB.kkutu_shop = new mainAgent.Table('kkutu_shop')
      DB.kkutu_shop_desc = new mainAgent.Table('kkutu_shop_desc')

      DB.session = new mainAgent.Table('session')
      DB.users = new mainAgent.Table('users')

      if (exports.ready) exports.ready(Redis, Pg)
      else JLog.warn('DB.onReady was not defined yet.')
    })
  }
}
