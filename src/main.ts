// const config = require("./ormconfig.json");
import { DataSource, DataSourceOptions } from "typeorm";
import ormConfig from "../ormconfig.json";
import { generateEntity } from "./generate.entity";
import { getColumnsByTable, getTablesByDatabase, makeEntity } from "./helper";

async function bootstrap() {
  try {
    // console.log(ormConfig, typeof ormConfig);
    const dataSource: DataSource = await new DataSource(
      ormConfig as DataSourceOptions
    ).initialize();
    // 쿼리 러너 세팅
    const queryRunner = dataSource.createQueryRunner();

    //테이블 명 가져오기
    const tables = await getTablesByDatabase(
      ormConfig.database,
      queryRunner.manager
    );

    // 테이블 별 컬럼 정보 가져오기
    const tableInfos = await getColumnsByTable(tables, queryRunner.manager);
    // 가져온 테이블 정보 바탕으로 엔티티 구성 및 파일 생성
    await Promise.all(tableInfos).then(async (v) => {
      v.map(generateEntity).forEach((v) => {
        makeEntity({
          database: ormConfig.database,
          tableName: v.tableName,
          content: v.content,
        });
      });
    });

    //쿼리 러너 해제
    await queryRunner.release();
    //데이터 소스 해제
    await dataSource.destroy();
    console.log("Entities generated.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

bootstrap();
