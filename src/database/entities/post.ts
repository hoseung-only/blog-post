import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  MoreThanOrEqual,
} from "typeorm";

import { Category } from "./category";

import { getConnection } from "../getConnection";

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

  public static async findById(id: string) {
    return (await this.getRepository()).findOne(id);
  }

  public static async create({title, content, categoryId}: { title: string, content: string, categoryId: number }) {
    const repository = (await this.getRepository());
    
    const post = repository.create();
    const category = new Category();
    
    category.id = Number(categoryId);

    post.title = title;
    post.content = content;
    post.category = category;

    return await repository.save(post);
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

  @ManyToOne(() => Category)
  @JoinColumn({ name: "category_id" })
  category: Category;
}
