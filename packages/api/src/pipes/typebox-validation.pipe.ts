import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { Value } from "@sinclair/typebox/value";
import type { TSchema } from "@sinclair/typebox";

@Injectable()
export class TypeBoxValidationPipe implements PipeTransform {
  constructor(private readonly schema: TSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (!Value.Check(this.schema, value)) {
      const errors = [...Value.Errors(this.schema, value)];
      const errorMessages = errors.map(
        (error) => `${error.path}: ${error.message}`
      );
      throw new BadRequestException(
        `Validation failed: ${errorMessages.join(", ")}`
      );
    }
    return value;
  }
}
