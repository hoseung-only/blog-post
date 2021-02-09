import * as request from "supertest";
import { expect } from "chai";

import { app } from "../../app";

import { Category } from "../../database/entities/category";

describe("Post Routers", () => {
  describe("POST / : create post", () => {
    context("When user has already created a category", () => {
      let categoryId: number;

      before(async () => {
        const category = await Category.create({ name: "category" });
        categoryId = category.id;
      });

      it("should create a new post", (done) => {
        const title = "title";
        const content = "content";

        request(app)
          .post("/post")
          .set("Content-Type", "application/json")
          .send({ title, content, categoryId })
          .expect(201)
          .then((response) => {
            expect(response.body.result).to.be.deep.contains({
              title,
              content,
              category: { id: categoryId },
            });
            done();
          })
          .catch((error) => done(error));
      });
    });
  });
});
