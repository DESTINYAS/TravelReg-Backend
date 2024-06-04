/* eslint-disable prettier/prettier */
// https://www.postgresql.org/docs/9.2/errcodes-appendix.html 

export enum PostgresErrorCode {
    UniqueViolation = '23505',
    ReferenceConstraint = '23503',
}