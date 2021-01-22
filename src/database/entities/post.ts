import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  MoreThan,
} from "typeorm";

import { Category } from "./category";

import { getConnection } from "../getConnection";

@Entity()
export class Post {
  private static async getRepository() {
    return (await getConnection()).getRepository(this);
  }

  public static async findByCursor(cursor: string) {
    return (await this.getRepository()).find({
      where: { id: MoreThan(cursor) },
      order: { id: "ASC" },
      take: 15,
    });
  }

  public static async findById(id: string) {
    return (await this.getRepository()).findOne(id);
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
