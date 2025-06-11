import type {Params} from 'nestjs-pino';
import {stdSerializers} from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const loggerOptions: Params = {
	pinoHttp: {
		level: isProduction ? 'info' : 'debug',
		transport: isProduction
			? undefined
			: {
					target: 'pino-pretty',
					options: {
						messageFormat: '{reqId} {msg}',
					},
				},
		redact: ['req.headers.authorization', 'req.headers.cookie'],
		formatters: {
			level: (label) => ({ severity: label.toUpperCase() }),
		},
		messageKey: 'message',
		serializers: {
			err: stdSerializers.err,
		},
		customProps: (req) => {
			return {
				reqId: req.id,
			};
		},
		base: {
			serviceContext: {
				service: 'nila-api',
			},
			resource: {
				type: 'cloud_run_revision',
			},
		},
	},
	exclude: ['/health'],
};
