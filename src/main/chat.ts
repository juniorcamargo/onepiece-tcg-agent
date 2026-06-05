import readline from "readline";
import { mastra } from "@infrastructure/mastra/index";
type UserMsg = { role: "user"; content: string };
type AssistantMsg = { role: "assistant"; content: string };
type Message = UserMsg | AssistantMsg;

const EXIT_COMMANDS = new Set(["exit", "quit", "bye", "sair"]);

async function main(): Promise<void> {
  const agent = mastra.getAgentById("onepiece-tcg-agent");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
  });

  const history: Message[] = [];

  console.log("One Piece TCG Rules Expert");
  console.log('Ask any rules question. Type "exit" to quit.\n');

  const nextQuestion = (): void => {
    rl.question("You: ", async (raw) => {
      const input = raw.trim();

      if (!input) {
        nextQuestion();
        return;
      }

      if (EXIT_COMMANDS.has(input.toLowerCase())) {
        console.log("Goodbye!");
        rl.close();
        return;
      }

      history.push({ role: "user", content: input });

      process.stdout.write("\nAgent: ");

      try {
        const stream = await agent.stream(history);
        let fullResponse = "";

        for await (const chunk of stream.textStream) {
          process.stdout.write(chunk);
          fullResponse += chunk;
        }

        process.stdout.write("\n\n");
        history.push({ role: "assistant", content: fullResponse });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        process.stdout.write(`\n[Error: ${msg}]\n\n`);
        history.pop();
      }

      nextQuestion();
    });
  };

  nextQuestion();
}

main().catch((err: unknown) => {
  console.error("Chat failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
