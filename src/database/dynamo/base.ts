import { DynamoDB, TableDescription } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

export type TableSchema = Required<Pick<TableDescription, "TableName" | "KeySchema" | "AttributeDefinitions">>;

export class Table {
  private client = new DynamoDB({ region: "ap-northeast-2", endpoint: process.env.DYNAMODB_ENDPOINT });

  constructor(public schema: TableSchema) {
    this.schema = schema;
  }

  protected async getItem<T extends {}>(input: T) {
    const result = await this.client.getItem({
      TableName: this.schema.TableName,
      Key: marshall(input),
    });
    return (result.Item ? unmarshall(result.Item) : null) as T | null;
  }

  protected async putItem<T extends {}>(input: T) {
    await this.client.putItem({
      TableName: this.schema.TableName,
      Item: marshall(input),
    });
  }

  protected async deleteItem<T extends {}>(input: T) {
    await this.client.deleteItem({
      TableName: this.schema.TableName,
      Key: marshall(input),
    });
  }
}
