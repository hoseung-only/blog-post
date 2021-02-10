import * as _ from "lodash";
import * as request from "supertest";
import { expect } from "chai";

import { app } from "../../app";

import { Category } from "../../database/entities/category";

describe("Category Routers", () => {
  let categoryId: number;

  before(async () => {
    const { id } = await Category.create({ name: "parent category" });
    categoryId = id;
  });

  after(async () => {
    await Category.dropTable();
  });

  describe("GET /:id : get category by id", () => {
    context("When user has created category", () => {
      it("should return requested category", async () => {
        return request(app)
          .get(`/category/${categoryId}`)
          .expect(200)
          .then((response) => {
            const { result } = response.body;

            expect(result).to.be.deep.contain({
              name: "parent category",
            });
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
            Category.create({ name: "child category", parentId: categoryId })
          )
        );

        childrenIds = results.map((e) => e.id);
      });

      after(async () => {
        await Category.deleteByIds(childrenIds);
      });

      it("should return requested category", async () => {
        return request(app)
          .get(`/category/${categoryId}/children`)
          .expect(200)
          .then((response) => {
            const { result } = response.body;

            expect(result.length).to.be.eq(5);
            expect(result).to.be.deep.eq([
              {
                id: 2,
                name: "child category",
              },
              {
                id: 3,
                name: "child category",
              },
              {
                id: 4,
                name: "child category",
              },
              {
                id: 5,
                name: "child category",
              },
              {
                id: 6,
                name: "child category",
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
          .get(`/category/${categoryId}/children`)
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
});
