import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

interface MySqlError extends Error {
  errno: number;
  sqlMessage: string;
  sqlState?: string;
  code?: string;
}

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
  private readonly errorCodes = {
    1062: 'DUPLICATE_ENTRY',
    1451: 'FOREIGN_KEY_VIOLATION_DELETE',
    1452: 'FOREIGN_KEY_VIOLATION_INSERT',
    1054: 'UNKNOWN_COLUMN',
    1146: 'TABLE_NOT_EXISTS',
    1216: 'FOREIGN_KEY_CONSTRAINT_ADD',
    1217: 'FOREIGN_KEY_CONSTRAINT_DELETE',
    1364: 'FIELD_NOT_NULL',
    1406: 'DATA_TOO_LONG',
    1265: 'DATA_TRUNCATED',
  };

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const driverError = exception.driverError as MySqlError;

    const errorResponse = this.createErrorResponse(driverError);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private createErrorResponse(error: MySqlError): {
    statusCode: number;
    message: string;
    error: string;
    detail?: string;
  } {
    switch (error.errno) {
      case 1062: {
        const { column, value } = this.extractDuplicatedKey(error.sqlMessage);
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `Duplicate entry for ${this.formatColumnName(column)}`,
          error: 'Conflict',
          detail: `The value '${value}' already exists.`,
        };
      }

      case 1451:
      case 1452: {
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'Foreign key constraint violation',
          error: 'Constraint Violation',
          detail: this.formatConstraintMessage(error.sqlMessage),
        };
      }

      case 1054: {
        const column = error.sqlMessage.match(/Unknown column '(.+?)'/)?.[1];
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid column reference',
          error: 'Bad Request',
          detail: `Column '${column}' does not exist`,
        };
      }

      case 1364: {
        const column = error.sqlMessage.match(/Field '(.+?)'/)?.[1];
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Missing required field',
          error: 'Bad Request',
          detail: `The field '${column}' cannot be null`,
        };
      }

      case 1406: {
        const matches = error.sqlMessage.match(
          /Data too long for column '(.+?)'/,
        );
        const column = matches?.[1];
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Data too long',
          error: 'Bad Request',
          detail: `The value for '${column}' exceeds the maximum length`,
        };
      }

      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Database error: ${this.errorCodes[error.errno] || 'Unknown error'}`,
          error: 'Internal Server Error',
          detail:
            process.env.NODE_ENV === 'development'
              ? error.sqlMessage
              : undefined,
        };
    }
  }

  private extractDuplicatedKey(sqlMessage: string): {
    column: string;
    value: string;
  } {
    const valueMatch = sqlMessage.match(/Duplicate entry '(.+?)'/);
    const keyMatch = sqlMessage.match(/for key '(.+?)'/);

    const value = valueMatch ? valueMatch[1] : 'unknown';
    const key = keyMatch ? keyMatch[1] : 'unknown';

    return { column: key, value };
  }

  private formatColumnName(columnName: string): string {
    if (columnName.startsWith('IDX_')) {
      return 'unique constraint';
    }
    return columnName
      .replace(/^UQ_|^FK_|^IDX_/, '')
      .split('_')
      .map((word) => word.toLowerCase())
      .join(' ');
  }

  private formatConstraintMessage(sqlMessage: string): string {
    const tableMatch = sqlMessage.match(/REFERENCES `(.+?)`/);
    const table = tableMatch ? tableMatch[1] : 'referenced';
    return `Operation cannot be completed because of a relationship constraint with table '${table}'`;
  }
}
