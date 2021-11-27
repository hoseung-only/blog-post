import { Table } from "./base";

interface Properties {
  userId: string;
  postId: string;
  expiredAt: number;
}

class PostViewedUser extends Table {
  constructor() {
    super({
      TableName: "post_viewed_user",
      KeySchema: [
        { AttributeName: "userId", KeyType: "HASH" },
        { AttributeName: "postId", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "userId", AttributeType: "S" },
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

export const postViewedUser = new PostViewedUser();
