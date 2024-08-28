import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import * as _ from "lodash";
import { EntityManager, TableColumn } from "typeorm";

// mysql 타입 별 타입스크립트 프로퍼티 매핑
export function mapPropertyType(columnType: string): string {
  switch (columnType) {
    case "varchar":
    case "char":
    case "datetime":
    case "date":
      return "string";
    case "bigint":
    case "int":
    case "double":
    case "float":
      return "number";
    case "tinyint":
      return "boolean";
    default:
      return "any";
  }
}

// 데코레이터에 사용할 타입 구성
export function mapColumnType(columnType: string): string {
  return `type: '${columnType}',`;
}

// 데이터베이스에서 테이블 명과 스키마 추출
export async function getTablesByDatabase(
  databaseName: string,
  manager: EntityManager
): Promise<{ tableName: string; tableSchema: string }[]> {
  const tablesQuery = `
      SELECT *
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = '${databaseName}'
        AND TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME NOT LIKE 'sys_%'
        AND TABLE_NAME NOT LIKE 'performance_schema.%'
    `;

  const result = await manager.query(tablesQuery);

  return result.map((row: any) => {
    const { TABLE_NAME: tableName, TABLE_SCHEMA: tableSchema } = row;
    // console.log(row.TABLE_NAME, typeof row.TABLE_NAME);
    return { tableName, tableSchema };
  });
}

// 테이블에서 컬럼 추출
export async function getColumnsByTable(
  tables: { tableName: string; tableSchema: string }[],
  manager: EntityManager
) {
  return tables.map(
    async (table: { tableName: string; tableSchema: string }) => {
      const columnsQuery = `
        SELECT *
        FROM information_schema.columns
        WHERE table_schema = '${table.tableSchema}'
          AND table_name = '${table.tableName}'
        ORDER BY ordinal_position asc
      `;
      const columnsResult = await manager.query(columnsQuery);
      const columns = columnsResult.map((row: any) => {
        return {
          name: "" + row.COLUMN_NAME,
          type: "" + row.DATA_TYPE,
          isNullable: row.IS_NULLABLE === "YES",
          length: row.CHARACTER_MAXIMUM_LENG,
          default: row.COLUMN_DEFAULT,
          isPrimary: row.COLUMN_KEY === "PRI",
          comment: "" + row.COLUMN_COMMENT,
        } as TableColumn;
      });
      return { tableName: table.tableName, columns };
    }
  );
}

// 파일 생성
export async function makeEntity(makeData: {
  database: string;
  tableName: string;
  content: string;
}) {
  const { database, tableName, content } = makeData;

  const dir = __dirname + `/entities/${database}`;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const fileName = `${_.chain(tableName).lowerCase().kebabCase()}.entity.ts`;
  // writeFileSync(path, content);
  // write
  await writeFile(`${dir}/${fileName}`, content, "utf8");
}
