import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";

import { getConnection } from "../getConnection";

@Entity()
export class Category {
  private static async getRepository() {
    return (await getConnection()).getRepository(this);
  }

  public static async create(attributes: { name: string; parentId?: number }) {
    const { name, parentId = null } = attributes;

    const category = new this();
    category.name = name;

    if (parentId) {
      const parent = await this.findById(parentId);

      if (parent) {
        category.parent = parent;
      }
    }

    return (await this.getRepository()).save(category);
  }

  public static async findById(id: number) {
    return (await this.getRepository()).findOne(id);
  }

  public static async removeAll() {
    await (await this.getRepository()).clear();
  }

  @Index()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: "parent_id" })
  parent: Category;
}
