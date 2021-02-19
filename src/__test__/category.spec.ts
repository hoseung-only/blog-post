import * as _ from "lodash";
import * as request from "supertest";
import { expect } from "chai";

import { app } from "../app";

import { Category } from "../database/entities/category";

describe("Category Routers", () => {
  let parentCategory: Category;

  before(async () => {
    parentCategory = await Category.create({ name: "parent category" });
  });

  after(async () => {
    await Category.dropTable();
  });

  describe("GET /:id : get category by id", () => {
    context("When user has created category", () => {
      it("should return requested category", async () => {
        return request(app)
          .get(`/category/${parentCategory.id}`)
          .expect(200)
          .then((response) => {
            const { result } = response.body;

            expect(result).to.be.deep.eq(parentCategory);
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("GET /:id/children : get category by parent id", () => {
    context("When requested category has any child categories", () => {
      let childrenIds: number[];

      before(async () => {
        const results = await Promise.all(
          _.times(5, () =>
            Category.create({
              name: "child category",
              parentId: parentCategory.id,
            })
          )
        );

        childrenIds = results.map((e) => e.id);
      });

      after(async () => {
        await Category.deleteByIds(childrenIds);
      });

      it("should return requested category", async () => {
        return request(app)
          .get(`/category/${parentCategory.id}/children`)
          .expect(200)
          .then((response) => {
            const { result } = response.body;

            expect(result.length).to.be.eq(5);
            expect(result).to.be.deep.eq([
              {
                id: 2,
                name: "child category",
                parentId: parentCategory.id,
              },
              {
                id: 3,
                name: "child category",
                parentId: parentCategory.id,
              },
              {
                id: 4,
                name: "child category",
                parentId: parentCategory.id,
              },
              {
                id: 5,
                name: "child category",
                parentId: parentCategory.id,
              },
              {
                id: 6,
                name: "child category",
                parentId: parentCategory.id,
              },
            ]);
          })
          .catch((error) => {
            throw error;
          });
      });
    });

    context("When requested category doesn't has any child categories", () => {
      it("should return requested category", async () => {
        return request(app)
          .get(`/category/${parentCategory.id}/children`)
          .expect(200)
          .then((response) => {
            const { result } = response.body;

            expect(result).to.be.null;
          })
          .catch((error) => {
            throw error;
          });
      });
    });
  });

  describe("POST / : create category", () => {
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
