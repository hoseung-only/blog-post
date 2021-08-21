import * as _ from "lodash";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  LessThan,
  In,
} from "typeorm";

import { Category } from "./category";

import { getConnection } from "./getConnection";

import { ErrorResponse } from "../../utils/error";

@Entity()
export class Post {
  private static async getRepository() {
    return (await getConnection()).getRepository(this);
  }

  public static async findByCursor({ count, cursor }: { count: number; cursor?: number }) {
    return (await this.getRepository()).find({
      where: { createdAt: LessThan(cursor ? new Date(cursor) : new Date()) },
      order: { createdAt: "DESC" },
      take: count,
    });
  }

  public static async findCategoryPostsByCursor({
    categoryId,
    count,
    cursor,
  }: {
    categoryId: string;
    count: number;
    cursor?: number;
  }) {
    const categoryIds = _.chain(
      await Promise.all([
        (await Category.findById(categoryId))?.id,
        (await Category.findByParentId(categoryId)).map((category) => category.id),
      ])
    )
      .flatten()
      .compact()
      .value();

    return (await this.getRepository()).find({
      where: { createdAt: LessThan(cursor ? new Date(cursor) : new Date()), categoryId: In(categoryIds) },
      order: { createdAt: "DESC" },
      take: count,
    });
  }

  public static async findById(id: string) {
    return (await this.getRepository()).findOne(id);
  }

  public static async create({
    title,
    coverImageURL,
    content,
    categoryId,
    summary,
  }: {
    title: string;
    coverImageURL: string;
    content: string;
    categoryId?: string;
    summary: string;
  }) {
    const repository = await this.getRepository();

    const post = repository.create();

    post.title = title;
    post.viewCount = 0;
    post.coverImageURL = coverImageURL;
    post.content = content;
    post.categoryId = categoryId ?? null;
    post.summary = summary;

    return await repository.save(post);
  }

  public static async update({
    id,
    title,
    coverImageURL,
    content,
    categoryId,
    summary,
  }: {
    id: string;
    title: string;
    coverImageURL: string;
    content: string;
    categoryId?: string;
    summary: string;
  }) {
    const post = await this.findById(id);

    if (!post) {
      throw new ErrorResponse(422, "Post does not exist");
    }

    post.title = title;
    post.coverImageURL = coverImageURL;
    post.content = content;
    post.categoryId = categoryId ?? null;
    post.summary = summary;

    return (await this.getRepository()).save(post);
  }

  public static async deleteByIds(ids: string[]) {
    await (await this.getRepository()).delete(ids);
  }

  /**
   * This method only used for test.
   */
  public static async dropTable() {
    await (await this.getRepository()).clear();
  }

  public static async increaseViewCount(id: string) {
    const post = await this.findById(id);

    if (!post) {
      throw new ErrorResponse(422, "Post does not exist");
    }

    post.viewCount = post.viewCount + 1;

    return (await this.getRepository()).save(post);
  }

  @Index()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  title: string;

  @Column({ type: "integer", name: "view_count" })
  viewCount: number;

  @Column({ type: "varchar", length: 500, name: "cover_image_url" })
  coverImageURL: string;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "text" })
  summary: string;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  createdAt: Date;

  @Column({ name: "category_id", nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, { onDelete: "CASCADE" })
  @JoinColumn({ name: "category_id" })
  category: Category | null;
}
