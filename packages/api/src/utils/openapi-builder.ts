import {DocumentBuilder} from '@nestjs/swagger';

export const OPENAPI_SPEC = new DocumentBuilder()
	.setTitle('Nila API')
	.setDescription('Core API for Nila platform')
	.setVersion('1.0')
	.setOpenAPIVersion('3.1.0')
	.addBearerAuth({
		scheme: 'bearer',
		bearerFormat: 'JWT',
		type: 'http',
	})
	.build();
