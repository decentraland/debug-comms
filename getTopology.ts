import fetch from "node-fetch";

export async function getTopology(server: string, layer: string) {
  const url = `https://${server}/comms/layers/${layer}/topology`;
  const request = await fetch(url);
  return await request.json();
}
