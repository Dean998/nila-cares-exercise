import {basePlatformUserSchema} from '../src/db/schemas/shared.ts';
import {type Static} from '@sinclair/typebox';

declare module 'fastify' {
	interface FastifyRequest {
		user: Static<typeof basePlatformUserSchema> & { id: number; accountId: number; addressId: number };
	}
}
