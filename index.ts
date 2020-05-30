import fetch from 'node-fetch'

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

async function main() {
  const server = 'peer.decentraland.org'
  const layer = 'amber'
  const url = `https://${server}/comms/layers/${layer}/topology`
  const request = await fetch(url)
  const result = await request.json()

  const graphDot = toGraphString(result)
  console.log(graphDot)
}

main().catch(e => console.log(e))
