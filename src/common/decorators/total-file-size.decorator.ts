import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MaxTotalFileSize(
  maxSizeInMB: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'maxTotalFileSize',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: any, args: ValidationArguments) {
          if (!value) return true;
          const totalSize = value.reduce(
            (sum: number, doc: any) => sum + (doc.fileSize || 0),
            0,
          );
          return totalSize <= maxSizeInMB * 1024 * 1024; // Convert MB to bytes
        },
        defaultMessage(): string {
          return `Total file size cannot exceed ${maxSizeInMB}MB`;
        },
      },
    });
  };
}
