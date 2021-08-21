import { DynamoDB } from "@aws-sdk/client-dynamodb";

import { postViewedIP } from "../postViewedIP";

const client = new DynamoDB({ region: "ap-northeast-2", endpoint: process.env.DYNAMODB_ENDPOINT });

const tables = [postViewedIP];

before(async () => {
  for (const table of tables) {
    await client.createTable({
      ...table.schema,
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    });
  }
});

after(async () => {
  for (const table of tables) {
    await client.deleteTable({
      TableName: table.schema.TableName,
    });
  }
});
