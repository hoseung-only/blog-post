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
          .get(`/posts/${post.id}`)
          .expect(200)
          .then((response) => {
            const result = response.body;

            expect(result).to.be.deep.eq({
              id: post.id,
              title: post.title,
              content: post.content,
              categoryId: post.categoryId,
              createdAt: post.createdAt.valueOf(),
            });
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("GET / : get post list", () => {
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
          .get("/posts")
          .query({ cursor: 10 })
          .expect(200)
          .then((response) => {
            const { posts, nextCursor } = response.body;

            // list length should be 6 (id 10 ~ 15)
            expect(posts.length).to.be.eq(6);
            // id of first post should be 10
            expect(posts[0].id).to.be.eq(10);
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
          .get("/posts")
          .expect(200)
          .then((response) => {
            const { posts, nextCursor } = response.body;

            // maximun of list length is 10
            expect(posts.length).to.be.eq(10);
            // id of first post should be 1
            expect(posts[0].id).to.be.eq(1);
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
          .post("/posts")
          .send({ title, content, categoryId })
          .expect(201)
          .then((response) => {
            expect(response.body).to.be.deep.contains({
              title,
              content,
              categoryId,
            });
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("DELETE / : delete posts by ids", () => {
    context("When user requests to delete posts", () => {
      let postIds: number[];

      before(async () => {
        const category = await Category.create({ name: "category" });
        postIds = (
          await Promise.all(
            _.times(5, () =>
              Post.create({ title: "", content: "", categoryId: category.id })
            )
          )
        ).map((post) => post.id);
      });

      it("should delete posts by given ids and return success", async () => {
        return request(app)
          .delete("/posts")
          .send({ ids: [] })
          .expect(200)
          .then(async (response) => {
            expect(response.body.success).to.be.true;
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });
});
