import { Mastra } from "@mastra/core";
import { buildContainer } from "../config/container";
import { createSearchRulesTool } from "./tools/search-rules.tool";
import { createOnePieceTcgAgent } from "./agent/onepiece-tcg.agent";

const container = buildContainer();

const searchRulesTool = createSearchRulesTool(container.askQuestion);

const onePieceTcgAgent = createOnePieceTcgAgent({
  [searchRulesTool.id]: searchRulesTool,
});

export const mastra = new Mastra({
  agents: { onePieceTcgAgent },
});
