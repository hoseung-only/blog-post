import * as _ from "lodash";
import * as request from "supertest";
import { expect } from "chai";

import { app } from "../app";

import { Category } from "../database/entities/category";

describe("Category Routers", () => {
  describe("GET /list : get all categories", () => {
    context("When user requests but there are no categories", () => {
      it("should return empty array", async () => {
        return request(app)
          .get("/category/list")
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
        const result = await Promise.all(
          _.times(2, () => Category.create({ name: "parent" }))
        );
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
          .get("/category/list")
          .expect(200)
          .then((response) => {
            const { data } = response.body;

            expect(data.length).to.be.eq(2);
            expect(
              [data[0].children.length, data[1].children.length].sort()
            ).to.be.deep.eq([2, 3]);
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
          .post("/category")
          .send({ name: "category" })
          .expect(201)
          .then((response) => {
            const { result } = response.body;

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
          .post("/category")
          .send({ name: "category", parentId: parentCategory.id })
          .expect(201)
          .then((response) => {
            const { result } = response.body;

            expect(result).to.be.deep.contains({
              name: "category",
              parent: parentCategory,
            });
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When user requests with the invalid id of parent category", () => {
      it("should return error response", async () => {
        return request(app)
          .post("/category")
          .send({ name: "category", parentId: 12345 })
          .expect(400)
          .then((response) => {
            const { message } = response.body;

            expect(message).to.be.eq("Provided parent category does not exist");
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context(
      "When user requests with the id of parent category which already has parent",
      () => {
        let parentId: number;

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
            .post("/category")
            .send({ name: "category", parentId })
            .expect(400)
            .then((response) => {
              const { message } = response.body;

              expect(message).to.be.eq(
                "Depth of categories have to be up to 2"
              );
            })
            .catch((error) => {
              throw error;
            });
        });
      }
    );
  });
});
