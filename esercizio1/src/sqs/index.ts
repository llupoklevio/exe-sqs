import {
  CreateQueueCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  SetQueueAttributesCommand,
  SQSClient,
  QueueDoesNotExist,
} from "@aws-sdk/client-sqs";
import { responseCreateQueue } from "./type";
import { SqSError } from "../errors/SqsError";

export const sqsClient = new SQSClient({});

export async function createQueue(
  QueueName: string,
  Attributes: Record<string, string> = {},
  flag?: { overwrite: boolean; get: boolean },
): Promise<responseCreateQueue> {
  const isSame = await sameSqs(QueueName);

  if (
    (isSame && flag && flag.get === false && flag.overwrite === false) ||
    (isSame && !flag)
  ) {
    throw new SqSError({
      message: "La coda esiste già",
      url: isSame,
    });
  }

  if (isSame && flag && flag.get === true) {
    const attributes = await sqsClient.send(
      new GetQueueAttributesCommand({
        QueueUrl: isSame,
        AttributeNames: ["QueueArn"],
      }),
    );

    if (!isSame || !attributes.Attributes?.QueueArn) {
      throw new SqSError({
        message: "Failed to create queue or retrieve attributes",
      });
    }

    return { url: isSame, arn: attributes.Attributes.QueueArn };
  }

  if (isSame && flag && flag.get === false && flag.overwrite === true) {
    await sqsClient.send(
      new SetQueueAttributesCommand({
        Attributes: Attributes,
        QueueUrl: isSame,
      }),
    );
  }

  const { QueueUrl } = await sqsClient.send(
    new CreateQueueCommand({ QueueName, Attributes }),
  );

  const attributes = await sqsClient.send(
    new GetQueueAttributesCommand({
      QueueUrl: QueueUrl,
      AttributeNames: ["QueueArn"],
    }),
  );

  if (!QueueUrl || !attributes.Attributes?.QueueArn) {
    throw new SqSError({
      message: "Failed to create queue or retrieve attributes",
    });
  }

  return { url: QueueUrl, arn: attributes.Attributes.QueueArn };
}

async function sameSqs(QueueName: string): Promise<string> {
  try {
    const { QueueUrl } = await sqsClient.send(
      new GetQueueUrlCommand({ QueueName: QueueName }),
    );

    if (!QueueUrl) return "";

    return QueueUrl;
  } catch (err) {
    if (err instanceof QueueDoesNotExist) {
      return "";
    }

    throw err;
  }
}
