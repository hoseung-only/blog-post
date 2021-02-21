import * as _ from "lodash";
import * as request from "supertest";
import { expect } from "chai";

import { app } from "../app";

import { Post } from "../database/entities/post";
import { Category } from "../database/entities/category";

describe("Post Routers", () => {
  after(async () => {
    await Post.dropTable();
    await Category.dropTable();
  });

  describe("GET /:id : get specific post", () => {
    let post: Post;

    before(async () => {
      const { id } = await Category.create({ name: "category" });
      post = await Post.create({
        title: "title",
        content: "content",
        categoryId: id,
      });
    });

    after(async () => {
      await Post.dropTable();
      await Category.dropTable();
    });

    context("When user requests", () => {
      it("should return requested post", async () => {
        return request(app)
          .get(`/post/${post.id}`)
          .expect(200)
          .then((response) => {
            const { result } = response.body;

            expect(result).to.be.deep.eq({
              id: post.id,
              title: post.title,
              content: post.content,
              categoryId: post.categoryId,
              createdAt: post.createdAt.toISOString(),
            });
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("GET /list : get post list", () => {
    before(async () => {
      const { id } = await Category.create({ name: "category" });
      await Promise.all(
        _.times(15, () =>
          Post.create({
            title: "title",
            content: "content",
            categoryId: id,
          })
        )
      );
    });

    after(async () => {
      await Post.dropTable();
      await Category.dropTable();
    });

    context("When user requests with specific cursor", () => {
      it("should return post list starting with id 10", async () => {
        return request(app)
          .get("/post/list")
          .query({ cursor: 10 })
          .expect(200)
          .then((response) => {
            const { result, nextCursor } = response.body;

            // list length should be 6 (id 10 ~ 15)
            expect(result.length).to.be.eq(6);
            // id of first post should be 10
            expect(result[0].id).to.be.eq(10);
            // next cursor should be null (because there are no more posts)
            expect(nextCursor).to.be.null;
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When user requests without any specific cursor", () => {
      it("should return post list starting with id 1", async () => {
        return request(app)
          .get("/post/list")
          .expect(200)
          .then((response) => {
            const { result, nextCursor } = response.body;

            // maximun of list length is 10
            expect(result.length).to.be.eq(10);
            // id of first post should be 1
            expect(result[0].id).to.be.eq(1);
            // next cursor should be 11
            expect(nextCursor).to.be.eq(11);
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("POST / : create post", () => {
    context("When user has created a category", () => {
      let categoryId: number;

      before(async () => {
        const category = await Category.create({ name: "category" });
        categoryId = category.id;
      });

      it("should create a new post", async () => {
        const title = "title";
        const content = "content";

        return request(app)
          .post("/post")
          .set("Content-Type", "application/json")
          .send({ title, content, categoryId })
          .expect(201)
          .then((response) => {
            expect(response.body.result).to.be.deep.contains({
              title,
              content,
              categoryId: categoryId,
            });
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });
});
