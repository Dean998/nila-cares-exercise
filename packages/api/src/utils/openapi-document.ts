import {SwaggerModule} from '@nestjs/swagger';
import {OPENAPI_SPEC} from './openapi-builder';
import {writeFileSync} from 'fs';
import {join} from 'path';
import {app} from '../index';

try {
	const document = SwaggerModule.createDocument(app, OPENAPI_SPEC, {
		operationIdFactory: (controllerKey, methodKey, version) => methodKey + version.toUpperCase(),
	});

	const openapiSpec = JSON.stringify(document);
	const filePath = join(__dirname, '../../openapi.json');

	writeFileSync(filePath, openapiSpec, { encoding: 'utf8' });
	console.log('OpenAPI spec written successfully');
	process.exit(0);
} catch (err) {
	console.error('Error generating OpenAPI spec:', err);
	process.exit(1);
}
