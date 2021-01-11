import "reflect-metadata";
import { Connection, createConnection } from "typeorm";

import { Post } from "./entities/post";
import { Category } from "./entities/category";

let connection: Connection | undefined;

export const getConnection = async () => {
  if (!connection) {
    try {
      connection = await createConnection({
        name: "default",
        type: "mysql",
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
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
