import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client5 = new DynamoDBClient({ region: "us-east-1" });
const db5 = DynamoDBDocumentClient.from(client5);
const USERS_TABLE3 = process.env.USERS_TABLE;

export const handler = async (event) => {
  const { groupId, sortBy = "weeklyMinutes", limit = 10 } = event.queryStringParameters;

  const data = await db5.send(
    new ScanCommand({
      TableName: USERS_TABLE3,
      FilterExpression: "groupId = :g",
      ExpressionAttributeValues: { ":g": groupId },
    })
  );

  const sorted = (data.Items || [])
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, limit);

  return {
    statusCode: 200,
    body: JSON.stringify({ leaderboard: sorted }),
  };
};
