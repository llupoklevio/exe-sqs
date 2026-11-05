import { Command } from "commander";
import { startExercise } from "@exe-sqs/esercizio1";

console.log("Starting CLI...");

const exercises = startExercise();

const program = new Command();

program
  .name("exercise-cli")
  .description("CLI to test the SQS exercise")
  .version("1.0.0");

program
  .command("ex1")
  .description("Run the SQS exercise")
  .action(async () => {
    console.log("Running SQS exercise1...");
    const responseQueue1 = await exercises.create(
      "queue-test-alpha",
      {
        DelaySeconds: "20",
      },
      { get: true, overwrite: true },
    );
    console.log(responseQueue1, "queu1");
    try {
      await exercises.create("queue-test-alpha", { DelaySeconds: "20" });
    } catch (err) {
      if (err instanceof exercises.SqSError)
        console.log("L'errore sarà sul fatto che la coda esista", err.url);
    }

    const getSame = await exercises.create(
      "queue-test-alpha",
      {
        DelaySeconds: "20",
      },
      { get: true, overwrite: false },
    );

    console.log(
      "Avrò la stessa coda",
      responseQueue1.arn === getSame.arn,
      responseQueue1.url === getSame.url,
    );

    const getSameoverwrited = await exercises.create(
      "queue-test-alpha",
      {
        DelaySeconds: "25",
      },
      { get: false, overwrite: true },
    );

    console.log(
      "Avrò la stessa coda",
      responseQueue1.arn === getSameoverwrited.arn,
      responseQueue1.url === getSameoverwrited.url,
    );
  });

program.parseAsync();
