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
 */

const Cluster = require('cluster')
const global = require('./global.json')
// 볕뉘 수정
const CPU = Number(process.argv[2] || global.CLUSTER_SLAVES || require('os').cpus().length) // require("os").cpus().length;
// 볕뉘 수정

if (isNaN(CPU)) {
  console.log(`Invalid CPU Number ${CPU}`)
  process.exit(1)
}
if (Cluster.isMaster) {
  for (let i = 0; i < CPU; i++) {
    Cluster.fork({ SERVER_NO_FORK: true, WS_KEY: i + 1 })
  }
  Cluster.on('exit', function (w) {
    console.log(`Worker ${w.process.pid} died`)
  })
} else {
  require('./main.js')
}
