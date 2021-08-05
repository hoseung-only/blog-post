import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";

import { getConnection } from "../getConnection";

import { ErrorResponse } from "../../utils/error";

@Entity()
export class Category {
  private static async getRepository() {
    return (await getConnection()).getRepository(this);
  }

  private static async findParentById(id: number) {
    const parent = await this.findById(id);

    if (parent) {
      if (!parent.parentId) {
        return parent;
      } else {
        throw new ErrorResponse(400, "Depth of categories has to be up to 2");
      }
    } else {
      throw new ErrorResponse(400, "Provided parent category does not exist");
    }
  }

  public static async create(attributes: { name: string; parentId?: number }) {
    const { name, parentId = null } = attributes;

    const category = new this();
    category.name = name;

    if (parentId) {
      category.parent = await this.findParentById(parentId);
    }

    return (await this.getRepository()).save(category);
  }

  public static async update({ id, name, parentId }: { id: number; name: string; parentId?: number }) {
    const category = await this.findById(id);

    if (!category) {
      throw new ErrorResponse(404, "Category does not exist");
    }

    category.name = name;

    if (parentId) {
      category.parent = await this.findParentById(parentId);
    } else {
      category.parent = null;
    }

    return (await this.getRepository()).save(category);
  }

  public static async findById(id: number) {
    return (await this.getRepository()).findOne(id);
  }

  public static async findByParentId(id: number) {
    return (await this.getRepository()).find({ where: { parentId: id } });
  }

  public static async deleteByIds(ids: number[]) {
    await (await this.getRepository()).delete(ids);
  }

  public static async findAll() {
    return (await this.getRepository()).find({ order: { id: "DESC" } });
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

  @Column({ name: "parent_id", nullable: true })
  parentId: number | null;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Category, { onDelete: "CASCADE" })
  @JoinColumn({ name: "parent_id" })
  parent: Category | null;
}
