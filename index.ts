import cors from "cors";
import express from "express";
import { getPNG } from "./getPNG";
import { getTopology } from "./getTopology";
import { toGraphString } from "./toGraphString";

const app = express();
app.use(cors());
app.use((req, res, next) => {
  console.log(`request to: ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  const url =
    "https://debug-comms.decentraland.io/graph/peer.decentraland.org/amber";
  const repo = "https://github.com/decentraland/debug-comms";
  res.status(200).end(`
    <p>Try accessing something like: <a href="${url}">${url}</a></p>
    <p>Repo: <a href="${repo}">${repo}</a></p>`);
});

app.get("/health", (req, res) => {
  res.status(200).end('{"ok": true}');
});

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

app.listen(2500, () => {
  console.log(`:: listening on port 2500`);
});
