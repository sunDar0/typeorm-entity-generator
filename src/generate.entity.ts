import * as _ from "lodash";
import { TableColumn } from "typeorm";
import { mapColumnType, mapPropertyType } from "./helper";

export function generateEntity(tableInfos: {
  tableName: string;
  columns: TableColumn[];
}) {
  // console.log("start: ", tableName);
  const { tableName, columns } = tableInfos;
  let content = "";

  content +=
    `import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';\n\n` +
    `@Entity('${tableName}')\n` +
    `export class ${
      tableName.charAt(0).toUpperCase() + tableName.slice(1)
    } {\n`;

  columns.forEach((column) => {
    if (column.isPrimary) {
      content += `  @PrimaryGeneratedColumn({ name: '${column.name}'})\n`;
    } else {
      content += `  @Column({`;
      let columnName = `name: '${column.name}', `;
      let columnType = mapColumnType(column.type);

      let columnDefault = `default: ${
        column.default ? '"' + column.default + '"' : null
      }, `;
      let columnComment = `comment: '${column.comment}', `;
      let columnNullable = `nullable: ${column.isNullable}`;

      content +=
        `${columnName}${columnType}${columnDefault}${columnComment}${columnNullable}})` +
        "\n";
    }
    content += `  ${_.chain(column.name)
      .lowerCase()
      .camelCase()}: ${mapPropertyType(column.type)};\n`;
  });

  content += "}";
  return { tableName, content };
}
