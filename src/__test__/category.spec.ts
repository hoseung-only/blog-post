import * as _ from "lodash";
import * as request from "supertest";
import { expect } from "chai";

import { app } from "../app";

import { Category } from "../database/entities/category";
import { Post } from "../database/entities/post";

describe("Category Routers", () => {
  describe("GET / : get all categories", () => {
    context("When user requests but there are no categories", () => {
      it("should return empty array", async () => {
        return request(app)
          .get("/categories")
          .expect(200)
          .then((response) => {
            const { data } = response.body;

            expect(data.length).to.be.eq(0);
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When user requests", () => {
      before(async () => {
        const result = await Promise.all(_.times(2, () => Category.create({ name: "parent" })));
        await Promise.all(
          _.times(5, (index) =>
            Category.create({
              name: "child",
              parentId: result[index > 1 ? 0 : 1].id,
            })
          )
        );
      });

      after(async () => {
        await Category.dropTable();
      });

      it("should return categories", async () => {
        return request(app)
          .get("/categories")
          .expect(200)
          .then((response) => {
            const { data } = response.body;

            expect(data.length).to.be.eq(2);
            expect([data[0].children.length, data[1].children.length].sort()).to.be.deep.eq([2, 3]);
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("POST / : create category", () => {
    let parentCategory: Category;

    before(async () => {
      parentCategory = await Category.create({ name: "parent category" });
    });

    after(async () => {
      await Category.dropTable();
    });

    context("When user requests", () => {
      it("should create a new one and return the result of it", async () => {
        return request(app)
          .post("/categories")
          .send({ name: "category" })
          .expect(201)
          .then((response) => {
            const result = response.body;

            expect(result).to.be.deep.contains({ name: "category" });
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When user requests with the id of parent category", () => {
      it("should create a new one and return the result of it", async () => {
        return request(app)
          .post("/categories")
          .send({ name: "category", parentId: parentCategory.id })
          .expect(201)
          .then((response) => {
            const result = response.body;

            expect(result).to.be.deep.contains({
              name: "category",
              parentId: parentCategory.id,
            });
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When user requests with the invalid id of parent category", () => {
      it("should return error response", async () => {
        return request(app).post("/categories").send({ name: "category", parentId: "fasdfasdfsa" }).expect(400);
      });
    });

    context("When user requests with the id of parent category which already has parent", () => {
      let parentId: string;

      before(async () => {
        const { id } = await Category.create({
          name: "parent category",
          parentId: parentCategory.id,
        });

        parentId = id;
      });

      after(async () => {
        await Category.deleteByIds([parentId]);
      });

      it("should return error response", async () => {
        return request(app)
          .post("/categories")
          .send({ name: "category", parentId })
          .expect(400)
          .then((response) => {
            const { message } = response.body;

            expect(message).to.be.eq("Depth of categories has to be up to 2");
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("PUT /:id : update category", () => {
    let category: Category;
    let parentCategory: Category;

    before(async () => {
      category = await Category.create({ name: "category" });
      parentCategory = await Category.create({ name: "parent" });
    });

    after(async () => {
      await Category.dropTable();
    });

    context("When user requests to update name", () => {
      it("should return updated category", async () => {
        return request(app)
          .put(`/categories/${category.id}`)
          .send({ name: "updated category" })
          .expect(200)
          .then((response) => {
            const result = response.body;

            expect(result.name).to.be.eq("updated category");
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When user requests to set parent", () => {
      it("should return updated category", async () => {
        return request(app)
          .put(`/categories/${category.id}`)
          .send({ name: "updated category", parentId: parentCategory.id })
          .expect(200)
          .then((response) => {
            const result = response.body;

            expect(result.parentId).to.be.eq(parentCategory.id);
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("DELETE /:id : delete category by id", () => {
    let categoryId: string;

    before(async () => {
      const category = await Category.create({ name: "category" });
      categoryId = category.id;
    });

    context("When user requests to delete specific category", () => {
      it("should delete categories by given ids and return success", async () => {
        return request(app)
          .delete(`/categories/${categoryId}`)
          .expect(200)
          .then((response) => {
            expect(response.body.success).to.be.true;
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("GET /:id/posts : get category posts by cursor", () => {
    let parent: Category;
    let child: Category;

    before(async () => {
      parent = await Category.create({ name: "parent" });
      child = await Category.create({ name: "child", parentId: parent.id });

      await Promise.all(
        _.times(3, () =>
          Post.create({
            title: "parent",
            coverImageURL: "",
            content: "content",
            categoryId: parent.id,
            summary: "summary",
          })
        )
      );

      await Promise.all(
        _.times(3, () =>
          Post.create({
            title: "child",
            coverImageURL: "",
            content: "content",
            categoryId: child.id,
            summary: "summary",
          })
        )
      );
    });

    context("When user requests posts of parent", () => {
      it("should return posts including posts of child categories", async () => {
        return request(app)
          .get(`/categories/${parent.id}/posts`)
          .query({ count: 10 })
          .expect(200)
          .then((response) => {
            expect(response.body.data.length).to.be.eq(6);
            expect(response.body.nextCursor).to.be.null;
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When user requests posts of child", () => {
      it("should return posts of child category", async () => {
        return request(app)
          .get(`/categories/${child.id}/posts`)
          .query({ count: 10 })
          .expect(200)
          .then((response) => {
            expect(response.body.data.length).to.be.eq(3);
            expect(response.body.nextCursor).to.be.null;
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });
});
