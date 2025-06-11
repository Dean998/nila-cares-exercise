import {type TObject, type TProperties, type TSchema, Type} from '@sinclair/typebox';

export function contractSchemaDateTransform<T extends TProperties>(
	schema: TObject<T>,
	fields: Array<keyof T> = ['createdAt', 'updatedAt', 'deletedAt'] as Array<keyof T>,
): TObject<TProperties> {
	const fieldsToTransform = new Set(fields);
	const properties = schema.properties;
	const newProperties: Record<string, TSchema> = {};

	for (const [key, prop] of Object.entries(properties)) {
		if (fieldsToTransform.has(key) && prop.type === 'Date') {
			newProperties[key] = Type.String({ format: 'date-time' });
		} else if (prop?.anyOf?.find((ao) => ao.type === 'Date')) {
			newProperties[key] = Type.Union([Type.String({ format: 'date-time' }), Type.Null()]);
		} else {
			newProperties[key] = prop;
		}
	}

	return Type.Object(newProperties, schema);
}
