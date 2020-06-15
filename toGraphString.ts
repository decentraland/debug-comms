// Thanks https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
var stringToColour = function(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

export function toGraphString(input: {
  id: string;
  connectedPeerIds: string[];
  parcel: [number, number];
  coords?: [number, number];
}[]) {
  const mapId: Record<string, string> = {};
  const nodes: string[] = [];
  input.forEach((value) => {
    const id = value.id;
    const newId = id.substr(0, 6) + "..." + id.substr(id.length - 4);
    const color = stringToColour(newId)
    if (!value.parcel) {
      value.parcel = [200, 0];
    }
    value.coords = (value.parcel.map((_) => _ / 10) as [number, number]).map((_) => Math.floor(_)) as [number, number];
    nodes.push(`"${newId}" [fillcolor="${color}" pos="${value.coords.join(",")}!" label="${newId}\\n${value.parcel.join(",")}"];`);
    mapId[id] = newId;
  });
  const edges = input.map((value) => {
    const mapper = (_) => {
      if (!mapId[_]) {
        mapId[_] = _.substr(0, 6) + "..." + _.substr(_.length - 4);
      }
      return `  "${mapId[value.id]}" -> "${mapId[_]}";`;
    };
    return value.connectedPeerIds.map(mapper);
  });
  return `digraph G {
    graph [pad="0.212,0.055"];
    node [style=filled];
    \n${nodes.join("\n")}\n${edges.flat().join("\n")}\n}`;
}
