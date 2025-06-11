import {applyDecorators, Controller, UseGuards} from '@nestjs/common';
import {AuthGuard} from './auth.guard.ts';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import type {VersionValue} from '@nestjs/common/interfaces/version-options.interface';

export function AuthenticatedController(path: string, version?: VersionValue) {
	return applyDecorators(Controller({ path, version: version || '1' }), UseGuards(AuthGuard), ApiBearerAuth(), ApiTags(path));
}

export function NoAuthController(path: string, version?: VersionValue) {
	return applyDecorators(Controller({ path, version: version || '1' }), ApiTags(path));
}
