import "reflect-metadata";
import { Connection, createConnection } from "typeorm";

import { Post } from "./post";
import { Category } from "./category";

let connection: Connection | undefined;

export const getConnection = async () => {
  if (!connection) {
    try {
      connection = await createConnection({
        name: "default",
        type: "mysql",
        url: process.env.MYSQL_CONNECTION_URL,
        entities: [Post, Category],
        synchronize: true,
        extra: {
          connectionLimit: 1,
        },
      });
    } catch (error) {
      connection = undefined;
      throw error;
    }
  }

  return connection;
};
