import { buildContainer } from "@infrastructure/config/container";

async function main(): Promise<void> {
  const clearExisting = process.argv.includes("--clear");
  const container = buildContainer();

  console.log("One Piece TCG — document ingestion");
  console.log(`Source: ${container.pdfPath}`);
  if (clearExisting) {
    console.log("Mode: clear existing collection and re-ingest");
  }
  console.log("");

  const start = Date.now();
  const result = await container.ingestDocuments.execute({
    filePath: container.pdfPath,
    clearExisting,
  });
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`Done in ${elapsed}s`);
  console.log(`Chunks ingested: ${result.chunksIngested}`);
}

main().catch((err: unknown) => {
  console.error("Ingestion failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
