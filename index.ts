import fetch from 'node-fetch'
import * as express from 'express'
import * as cors from 'cors'
import * as graphviz from 'viz.js'

function toGraphString(input: { id: string, connectedPeerIds: string[] }[]) {
  const mapId: Record<string, string> = {}
  input.forEach(value => {
    const id = value.id
    const newId = id.substr(0, 6) + '...' + id.substr(id.length -  4)
    mapId[id] = newId
  })
  const edges = input.map(value => {
    const mapper = _ => {
      if (!mapId[_]) {
        mapId[_] = _.substr(0, 6) + '...' + _.substr(_.length -  4)
      }
      return `  "${mapId[value.id]}" -> "${mapId[_]}";`
    }
    return value.connectedPeerIds.map(mapper)
  })
  return `digraph G {\n${edges.flat().join('\n')}\n}`
}
async function getTopology(server: string, layer: string) {
  const url = `https://${server}/comms/layers/${layer}/topology`
  const request = await fetch(url)
  return await request.json()
}

async function getPNG(topology: { id: string, connectedPeerIds: string[] }[]) {
  return new Promise((resolve, reject) => {
    try {
      const result = toGraphString(topology)
      const child = spawn('dot', ['-Tpng'])
      const chunks: Buffer[] = []
      child.on('data', (data) => {
        console.log(`streamed ${data.length} bytes`)
        chunks.push(data)
      })
      child.on('close', code => {
        console.log(`closing with ${code}`)
        if (code !== 0) {
          return reject(`{"ok": false}`)
        }
        return resolve(Buffer.concat(chunks))
      })
      child.stdin.write(result)
      child.stdin.end()
    } catch (e) {
      reject(e.message)
    }
  })
}

const app = express()
app.use(cors())

app.get('/graph/:server/:layer/debug', async (req, res, next) => {
  const { server, layer } = req.params
  const topology = await getTopology(server, layer)

  try {
    const result = toGraphString(topology)
    return res.end(result)
  } catch (e) {
    res.status(500).end(`{"ok": false, "msg": "${e.message}"}`)
  }
})
app.get('/graph/:server/:layer', async (req, res, next) => {
  const { server, layer } = req.params
  const topology = await getTopology(server, layer)

  try {
    const png = await getPNG(topology)
    return res.end(png)
  } catch (e) {
    res.status(500).end(`{"ok": false, "msg": "${e.message}"}`)
  }
})

app.listen(2500)
