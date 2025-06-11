import {Global, Module, type Provider} from '@nestjs/common';
import {drizzle} from 'drizzle-orm/node-postgres';
import * as schema from './schemas';

export const db = drizzle({
	schema,
	casing: 'snake_case',
	connection: process.env.DATABASE_URL!,
});

export type DB = typeof db;

const dbProvider: Provider = {
	provide: 'DRIZZLE_CLIENT',
	useValue: db,
};

@Global()
@Module({
	providers: [dbProvider],
	exports: ['DRIZZLE_CLIENT'],
})
export class DatabaseModule {}