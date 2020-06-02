import { viz } from "./viz";
import { toGraphString } from "./toGraphString";
export async function getPNG(topology: {
  id: string;
  connectedPeerIds: string[];
  parcel: [number, number];
}[]) {
  return new Promise(async (resolve, reject) => {
    try {
      const str = toGraphString(topology);
      const result = await viz.renderString(str, {
        engine: "neato",
      });
      resolve(result);
    }
    catch (e) {
      reject(e.message);
    }
  });
}
