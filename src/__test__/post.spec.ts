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
        coverImageURL: "",
        content: "content",
        categoryId: id,
        summary: "summary",
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
              coverImageURL: "",
              content: post.content,
              summary: "summary",
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
    let posts: Post[];
    before(async () => {
      const { id } = await Category.create({ name: "category" });
      posts = await Promise.all(
        _.times(15, () =>
          Post.create({
            title: "title",
            coverImageURL: "",
            content: "content",
            categoryId: id,
            summary: "summary",
          })
        )
      );
    });

    after(async () => {
      await Post.dropTable();
      await Category.dropTable();
    });

    context("When user requests with specific cursor", () => {
      it("should return posts created before post 10", async () => {
        return request(app)
          .get("/posts")
          .query({ count: 15, cursor: posts[10].createdAt.valueOf() })
          .expect(200)
          .then((response) => {
            const { data, nextCursor } = response.body;

            expect(data.length).to.be.eq(10);
            expect(data[0].id).to.be.eq(posts[9].id);
            expect(nextCursor).to.be.null;
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When user requests without any specific cursor", () => {
      it("should return posts", async () => {
        return request(app)
          .get("/posts")
          .query({ count: 5 })
          .expect(200)
          .then((response) => {
            const { data, nextCursor } = response.body;

            expect(data.length).to.be.eq(5);
            expect(data[0].id).to.be.eq(posts[14].id);
            expect(nextCursor).to.be.eq(data[4].createdAt);
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("POST / : create post", () => {
    context("When user has created a category", () => {
      let categoryId: string;

      before(async () => {
        const category = await Category.create({ name: "category" });
        categoryId = category.id;
      });

      it("should create a new post", async () => {
        const title = "title";
        const coverImageURL = "url";
        const content = "content";
        const summary = "summary";

        return request(app)
          .post("/posts")
          .send({ title, coverImageURL, content, summary, categoryId })
          .expect(201)
          .then((response) => {
            expect(response.body).to.be.deep.contains({
              title,
              coverImageURL,
              content,
              summary,
              categoryId,
            });
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("PUT /:id : update post", () => {
    context("When user requests to edit post", () => {
      let post: Post;
      let category: Category;

      before(async () => {
        post = await Post.create({
          title: "asdf",
          coverImageURL: "",
          content: "asdf",
          summary: "asdf",
        });
        category = await Category.create({ name: "asdf" });
      });

      it("should return updated post", async () => {
        return request(app)
          .put(`/posts/${post.id}`)
          .send({
            title: "qwer",
            coverImageURL: "",
            content: "qwer",
            summary: "qwer",
            categoryId: category.id,
          })
          .expect(200)
          .then((response) => {
            expect(response.body.title).to.be.eq("qwer");
            expect(response.body.content).to.be.eq("qwer");
            expect(response.body.summary).to.be.eq("qwer");
            expect(response.body.categoryId).to.be.eq(category.id);
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("DELETE /:id : delete post by id", () => {
    let postId: string;

    before(async () => {
      const category = await Category.create({ name: "category" });
      const post = await Post.create({
        title: "",
        coverImageURL: "",
        content: "",
        categoryId: category.id,
        summary: "",
      });
      postId = post.id;
    });

    context("When user requests to delete specific post", () => {
      it("should delete posts by given ids and return success", async () => {
        return request(app)
          .delete(`/posts/${postId}`)
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
