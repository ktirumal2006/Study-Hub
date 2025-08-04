import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client3 = new DynamoDBClient({});
const db3 = DynamoDBDocumentClient.from(client3);
const SESSIONS_TABLE = process.env.SESSIONS_TABLE;

export const handler = async (event) => {
  const { sessionId, userId, groupId } = JSON.parse(event.body);
  const startTime = new Date().toISOString();

  await db3.send(new PutCommand({
    TableName: SESSIONS_TABLE,
    Item: { sessionId, userId, groupId, startTime },
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Session started", sessionId, startTime }),
  };
};