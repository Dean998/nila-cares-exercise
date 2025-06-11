import {
	type CallHandler,
	type ExecutionContext,
	Injectable,
	type NestInterceptor,
	SetMetadata,
	UseInterceptors,
	applyDecorators,
} from '@nestjs/common';
import {Reflector} from '@nestjs/core';

export const CORE_DL = [
	{ name: 'Anthony Jacob', email: 'anthony@nilacares.com' },
	{ name: 'Aditi Ramnath', email: 'aditi@nilacares.com' },
	{ name: 'Joe Hillyard', email: 'joe@nilacares.com' },
];

export const OPS_DL = [
	{ name: 'Anthony Jacob', email: 'anthony@nilacares.com' },
	{ name: 'Aditi Ramnath', email: 'aditi@nilacares.com' },
	{ name: 'Joe Hillyard', email: 'joe@nilacares.com' },
	{ name: 'Nikit Mehta', email: 'nikit@nilacares.com' },
	{ name: 'Muktha Prataap', email: 'muktha@nilacares.com' },
];

type EmailInterceptorProps<P extends string | unknown, B> = {
	email: { audience: 'core' | 'ops' | 'all'; emailTemplateId: string };
	params?: P;
	condition: (param: P extends unknown ? P : null, body: B extends unknown ? B : null) => boolean;
};

export const EMAIL_INTERCEPTOR_KEY = 'email_interceptor_key';

export function SendComms<P extends string | unknown, B>(options: EmailInterceptorProps<P, B>) {
	return applyDecorators(SetMetadata(EMAIL_INTERCEPTOR_KEY, options), UseInterceptors(EmailInterceptor<P, B>));
}

@Injectable()
class EmailInterceptor<P extends string | unknown, B> implements NestInterceptor {
	constructor(
		// email service...
		private reflector: Reflector,
		//private readonly emailService: EmailService
	) {}

	intercept(context: ExecutionContext, next: CallHandler) {
		const options = this.reflector.get<EmailInterceptorProps<P, B>>(EMAIL_INTERCEPTOR_KEY, context.getHandler()) || {
			audience: 'all',
		};

		const request = context.switchToHttp().getRequest();
		const method = request.method;
		const url = request.url;
		const body = request.body;
		const params = request.params;

		console.log(`[Request] ${method} ${url}`);
		console.log(`[Body] ${JSON.stringify(body)}`);
		console.log(`[Options] ${JSON.stringify(options)}`);

		if (options.condition(params, body)) {
		}

		return next.handle();
	}
}
