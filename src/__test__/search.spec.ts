import * as _ from "lodash";
import * as request from "supertest";
import { expect } from "chai";

import { app } from "../app";

import { Post } from "../database/mysql/post";
import { Category } from "../database/mysql/category";

describe("Search Routers", () => {
  after(async () => {
    await Post.dropTable();
  });

  describe("GET /posts : get posts by given query", () => {
    before(async () => {
      const { id } = await Category.create({ name: "category" });
      await Promise.all([
        ..._.times(3, async () => {
          return await Post.create({
            title: "Python",
            coverImageURL: "",
            content: "This post introduces Python.",
            categoryId: id,
            summary: "Start Python",
          });
        }),
        ..._.times(3, async () => {
          return await Post.create({
            title: "JAVA",
            coverImageURL: "",
            content: "This post introduces JAVA.",
            categoryId: id,
            summary: "Start JAVA",
          });
        }),
      ]);
    });

    after(async () => {
      await Post.dropTable();
      await Category.dropTable();
    });

    context("When user queries", () => {
      it("should return posts that matched", async () => {
        return request(app)
          .get(`/search/posts`)
          .query({
            query: "IntroDuces jaVA",
            count: 5,
          })
          .expect(200)
          .then((response) => {
            const { data, nextCursor } = response.body;

            expect(data.length).to.be.eq(3);
            expect(nextCursor).to.be.null;
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });
});
