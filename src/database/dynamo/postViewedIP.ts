import { Table } from "./base";

interface Properties {
  ip: string;
  postId: string;
  expiredAt: number;
}

class PostViewedIP extends Table {
  constructor() {
    super({
      TableName: "post_viewed_ip",
      KeySchema: [
        { AttributeName: "ip", KeyType: "HASH" },
        { AttributeName: "postId", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "ip", AttributeType: "S" },
        { AttributeName: "postId", AttributeType: "S" },
      ],
    });
  }

  public async create(input: Properties) {
    return await this.putItem(input);
  }

  public async find(input: Omit<Properties, "expiredAt">) {
    return await this.getItem(input);
  }

  public async delete(input: Omit<Properties, "expiredAt">) {
    return await this.deleteItem(input);
  }
}

export const postViewedIP = new PostViewedIP();
