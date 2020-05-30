import cors from "cors";
import express from "express";
import fetch from "node-fetch";
import graphviz from "viz.js";

const { Module, render } = require("viz.js/full.render.js");
const viz = new graphviz({ Module, render });

function toGraphString(
  input: { id: string; connectedPeerIds: string[]; parcel: [number, number], coords?: [number, number] }[]
) {
  const mapId: Record<string, string> = {};
  const nodes: string[] = [];

  input.forEach((value) => {
    const id = value.id;
    const newId = id.substr(0, 6) + "..." + id.substr(id.length - 4);
    if (!value.parcel) {
      value.parcel = [200, 0];
    }
    value.coords = (value.parcel.map((_) => _ / 10) as [
      number,
      number
    ]).map((_) => Math.floor(_)) as [number, number];
    nodes.push(
      `"${newId}" [fillcolor="#${id.substr(
        id.length - 6
      )}" pos="${value.coords.join(
        ","
      )}!" label="${newId}\\n${value.parcel.join(",")}"];`
    );
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

async function getTopology(server: string, layer: string) {
  const url = `https://${server}/comms/layers/${layer}/topology`;
  const request = await fetch(url);
  return await request.json();
}

async function getPNG(
  topology: {
    id: string;
    connectedPeerIds: string[];
    parcel: [number, number];
  }[]
) {
  return new Promise(async (resolve, reject) => {
    try {
      const str = toGraphString(topology);
      const result = await viz.renderString(str, {
        engine: "neato",
      });
      resolve(result);
    } catch (e) {
      reject(e.message);
    }
  });
}

const app = express();
app.use(cors());

app.get("/graph/:server/:layer/debug", async (req, res, next) => {
  const { server, layer } = req.params;
  const topology = await getTopology(server, layer);

  try {
    const result = toGraphString(topology);
    return res.end(result);
  } catch (e) {
    res.status(500).end(`{"ok": false, "msg": "${e.message}"}`);
  }
});
app.get("/graph/:server/:layer", async (req, res, next) => {
  const { server, layer } = req.params;
  const topology = await getTopology(server, layer);

  try {
    const png = await getPNG(topology);
    return res.end(png);
  } catch (e) {
    res.status(500).end(`{"ok": false, "msg": "${e.message}"}`);
  }
});

app.listen(2500);
