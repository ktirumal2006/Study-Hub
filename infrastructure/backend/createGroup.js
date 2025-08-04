import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);
const GROUPS_TABLE = process.env.GROUPS_TABLE;

export const handler = async (event) => {
  const { groupId, groupName, createdBy } = JSON.parse(event.body);
  const item = { groupId, groupName, createdBy, members: [createdBy] };

  await db.send(new PutCommand({
    TableName: GROUPS_TABLE,
    Item: item,
  }));

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Group created", group: item }),
  };
};