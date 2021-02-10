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

  public static async findByParentId(id: number) {
    const parent = new this();
    parent.id = id;

    return (await this.getRepository()).find({ where: { parent } });
  }

  public static async deleteByIds(ids: number[]) {
    (await this.getRepository()).delete(ids);
  }

  /**
   * This method only used for test.
   */
  public static async dropTable() {
    const repository = await this.getRepository();

    // ignore foreign key constraint to truncate
    await repository.query("SET FOREIGN_KEY_CHECKS = 0");
    await repository.clear();
    await repository.query("SET FOREIGN_KEY_CHECKS = 1");
  }

  @Index()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @ManyToOne(() => Category, { onDelete: "CASCADE" })
  @JoinColumn({ name: "parent_id" })
  parent: Category;
}
