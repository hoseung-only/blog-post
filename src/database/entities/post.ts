import * as _ from "lodash";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  MoreThanOrEqual,
  In,
} from "typeorm";

import { Category } from "./category";

import { getConnection } from "../getConnection";

import { ErrorResponse } from "../../utils/error";

@Entity()
export class Post {
  private static async getRepository() {
    return (await getConnection()).getRepository(this);
  }

  public static async findByCursor(cursor: number) {
    return (await this.getRepository()).find({
      where: { id: MoreThanOrEqual(cursor) },
      order: { id: "ASC" },
      take: 10,
    });
  }

  public static async findCategoryPostsByCursor(
    cursor: number,
    categoryId: number
  ) {
    const categoryIds = _.chain(
      await Promise.all([
        (await Category.findById(categoryId))?.id,
        (await Category.findByParentId(categoryId)).map(
          (category) => category.id
        ),
      ])
    )
      .flatten()
      .compact()
      .value();

    return (await this.getRepository()).find({
      where: { id: MoreThanOrEqual(cursor), categoryId: In(categoryIds) },
      order: { id: "ASC" },
      take: 10,
    });
  }

  public static async findById(id: number) {
    return (await this.getRepository()).findOne(id);
  }

  public static async create({
    title,
    content,
    categoryId,
  }: {
    title: string;
    content: string;
    categoryId?: number;
  }) {
    const repository = await this.getRepository();

    const post = repository.create();

    post.title = title;
    post.content = content;
    post.categoryId = categoryId ?? null;

    return await repository.save(post);
  }

  public static async edit({
    id,
    title,
    content,
    categoryId,
  }: {
    id: number;
    title: string;
    content: string;
    categoryId?: number;
  }) {
    const post = await this.findById(id);

    if (!post) {
      throw new ErrorResponse(404, "Post does not exist");
    }

    post.title = title;
    post.content = content;
    post.categoryId = categoryId ?? null;

    return (await this.getRepository()).save(post);
  }

  public static async deleteByIds(ids: number[]) {
    await (await this.getRepository()).delete(ids);
  }

  /**
   * This method only used for test.
   */
  public static async dropTable() {
    await (await this.getRepository()).clear();
  }

  @Index()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "text" })
  content: string;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  createdAt: Date;

  @Column({ name: "category_id", nullable: true })
  categoryId: number | null;

  @ManyToOne(() => Category, { onDelete: "CASCADE" })
  @JoinColumn({ name: "category_id" })
  category: Category;
}
