import { runAnalysis } from "../runAnalysis";

export const maxDuration = 60;

export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        await runAnalysis({
          onProgress(payload) {
            send({ type: "progress", ...payload });
          },
        }).then((result) => {
          send({ type: "done", data: result });
          controller.close();
        });
      } catch (e) {
        send({ type: "error", message: String(e) });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson" },
  });
}
