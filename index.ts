import cors from "cors";
import express from "express";
import { getTopology } from "./getTopology";
import { getPNG } from "./getPNG";
import { toGraphString } from "./toGraphString";

const app = express();
app.use(cors());
app.use((req, res, next) => {
  console.log(`request to: ${req.path}`);
  next();
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
