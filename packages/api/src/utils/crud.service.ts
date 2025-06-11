import {Inject, Injectable} from '@nestjs/common';
import type {SQL} from 'drizzle-orm';
import {eq} from 'drizzle-orm';
import type {PgTable} from 'drizzle-orm/pg-core';
import type {DB} from '../db/db';
import type {CrudInterface} from './crud.interface.ts';

@Injectable()
export abstract class GenericCrudService<
	TSelect,
	TInsert,
	TTable extends PgTable<any> & { id: any },
	TTableName extends keyof DB['query'],
> implements CrudInterface<TSelect, TInsert>
{
	protected constructor(
		@Inject('DRIZZLE_CLIENT') protected readonly db: DB,
		protected readonly table: TTable,
		protected readonly tableName: TTableName,
	) {}

	async getById(id: number): Promise<TSelect | undefined> {
		const result = await this.db.query[this.tableName].findFirst({
			where: eq(this.table.id as any, id),
		});
		return result as TSelect | undefined;
	}

	async getWhere(where: SQL<unknown> | undefined): Promise<TSelect[]> {
		const result = await this.db.query[this.tableName].findMany({
			where,
		});
		return result as TSelect[];
	}

	async getAll(): Promise<TSelect[]> {
		const results = await this.db.query[this.tableName].findMany();
		return results as TSelect[];
	}

	async create(body: TInsert): Promise<TSelect> {
		console.log(`Creating ${this.tableName} with body:`)
		console.log(body);
		const [result] = await this.db.insert(this.table).values(body).returning();
		return result as TSelect;
	}

	async update(id: number, body: Partial<TInsert>): Promise<TSelect> {
		const [result] = await this.db.update(this.table).set(body).where(eq(this.table.id, id)).returning();
		return result as TSelect;
	}

	async softDelete(id: number): Promise<TSelect> {
		const [result] = await this.db.update(this.table).set({ deletedAt: new Date() }).where(eq(this.table.id, id)).returning();
		return result as TSelect;
	}

	async delete(id: number): Promise<TSelect> {
		const [result] = await this.db.delete(this.table).where(eq(this.table.id, id)).returning();
		return result as TSelect;
	}
}
