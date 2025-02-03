import { plainToClass } from 'class-transformer';

const mapObjectProperties = (object: any): any => {
  if (Array.isArray(object)) {
    return object.map(mapObjectProperties);
  }
  if (object !== null && typeof object === 'object') {
    return Object.fromEntries(
      Object.entries(object).map(([key, value]) => [
        key,
        mapObjectProperties(value),
      ]),
    );
  }
  if (object && object.buffer && object.buffer.data) {
    const buffer = Buffer.from(object.buffer.data);
    return buffer.toString('hex');
  }
  return object;
};

export function documentMapping<T>(document: T, ClassType: new () => T): T;
export function documentMapping<T>(document: T[], ClassType: new () => T): T[];
export function documentMapping<T>(
  document: T | T[],
  ClassType: new () => T,
): T | T[] {
  if (Array.isArray(document)) {
    return document.map((item) => {
      const plainItem = JSON.parse(JSON.stringify(item));
      return plainToClass(ClassType, mapObjectProperties(plainItem));
    });
  }
  const plainDocument = JSON.parse(JSON.stringify(document));
  return plainToClass(ClassType, mapObjectProperties(plainDocument));
}
