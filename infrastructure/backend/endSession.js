import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client4 = new DynamoDBClient({ region: "us-east-1" });
const db4 = DynamoDBDocumentClient.from(client4);
const SESSIONS_TABLE2 = process.env.SESSIONS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

export const handler = async (event) => {
  const { sessionId, userId, durationMinutes } = JSON.parse(event.body);
  const endTime = new Date().toISOString();

  // 1) Update the session record with passed duration
  await db4.send(new UpdateCommand({
    TableName: SESSIONS_TABLE2,
    Key: { sessionId },
    UpdateExpression: "SET endTime = :e, durationMinutes = :d",
    ExpressionAttributeValues: {
      ":e": endTime,
      ":d": durationMinutes,
    },
  }));

  // 2) Increment the user’s totals
  await db4.send(new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: "ADD totalMinutes :m, weeklyMinutes :m",
    ExpressionAttributeValues: { ":m": durationMinutes },
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Session ended", sessionId, endTime, durationMinutes }),
  };
};