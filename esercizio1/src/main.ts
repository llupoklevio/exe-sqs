import "dotenv/config";
import { createQueue } from "./sqs";
import { SqSError } from "./errors/SqsError";

export function startExercise() {
  return {
    create: createQueue,
    SqSError,
  };
}
