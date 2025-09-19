import { CursorData, CursorFieldData, LegacyCursorData } from './interfaces';

/**
 * Encode cursor data to base64 string
 */
export function encodeCursor(data: CursorData | LegacyCursorData): string {
  const cursorString = JSON.stringify(data);
  return btoa(cursorString);
}

/**
 * Decode base64 cursor string to cursor data
 */
export function decodeCursor(cursor: string): CursorData {
  try {
    const cursorString = atob(cursor);
    const parsedCursorData = JSON.parse(cursorString);
    
    // Handle legacy format
    if (parsedCursorData.field && parsedCursorData.value !== undefined) {
      const legacyData = parsedCursorData as LegacyCursorData;
      return {
        fields: [{
          field: legacyData.field,
          value: legacyData.isDate ? new Date(legacyData.value) : legacyData.value,
          isDate: legacyData.isDate
        }],
        id: legacyData.id
      };
    }
    
    // Handle new format
    return {
      ...parsedCursorData,
      fields: parsedCursorData.fields.map((field: CursorFieldData) => ({
        ...field,
        value: field.isDate ? new Date(field.value) : field.value
      }))
    };
  } catch (error) {
    throw new Error('Invalid cursor format');
  }
}

/**
 * Create cursor from entity data
 */
export function createCursor(entity: any, fields: string | string[] = 'createdAt'): string {
  const id = entity.id;
  
  if (!id) {
    throw new Error('Entity must have an id field');
  }
  
  const fieldArray = Array.isArray(fields) ? fields : [fields];
  const cursorFields: CursorFieldData[] = fieldArray.map(field => {
    const value = entity[field];
    
    if (value === undefined || value === null) {
      throw new Error(`Field ${field} not found in entity`);
    }
    
    return {
      field,
      value,
      isDate: value instanceof Date
    };
  });
  
  return encodeCursor({
    fields: cursorFields,
    id
  });
}

/**
 * Validate cursor and return cursor data
 */
export function validateCursor(cursor: string | null | undefined): CursorData | null {
  if (!cursor) {
    return null;
  }
  
  try {
    return decodeCursor(cursor);
  } catch (error) {
    throw new Error('Invalid cursor provided');
  }
}

/**
 * Create edge from entity
 */
export function createEdge<T>(entity: T, cursorField: string | string[] = 'createdAt') {
  return {
    node: entity,
    cursor: createCursor(entity, cursorField)
  };
}