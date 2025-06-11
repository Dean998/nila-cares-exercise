import type {PgTable} from 'drizzle-orm/pg-core';

export interface CrudInterface<TSelect, TInsert, TTable extends PgTable<any> = any> {
	getById(id: number): Promise<TSelect | undefined>;

	getAll(): Promise<TSelect[]>;

	create(body: TInsert): Promise<TSelect>;

	update(id: number, body: Partial<TTable['$inferInsert']>): Promise<TSelect>;

	delete(id: number): Promise<TSelect>;
}
