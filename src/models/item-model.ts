import { PoolConnection } from "mysql2/promise";
import { Item } from "../interfaces/item";
import { RowDataPacket, OkPacket } from "mysql2";


/**
 * itemsテーブルのレコードを全件取得する
 * 
 * @param dbConnection 
 * @returns Item[]
 */
const getAllItems = async (dbConnection: PoolConnection): Promise<Item[]> => {
    const [rows] = await dbConnection.query<RowDataPacket[]>(
      "SELECT * FROM `items`;"
    );
  
    const result: Item[] = rows.map((row) => {
      return {
        id: row.id,
        name: row.name,
        heal: row.heal,
        price: row.price,
        percent: row.percent,
        itemType: row.itemType,
      };
    });
    return result;
  };
  /**
   * 指定したitemIdのレコードを取得する
   * @param req 
   * @param dbConnection 
   * @returns Item
   */
  const getItem = async (
    req: number,
    dbConnection: PoolConnection
  ): Promise<Item> => {
    const [rows] = await dbConnection.query<RowDataPacket[]>(
      "SELECT * FROM `items` WHERE `id` = ?;",
      [req]
    );
  
    const result: Item[] = rows.map((row) => {
        return {
          id: row.id,
          name: row.name,
          heal: row.heal,
          price: row.price,
          percent: row.percent,
          itemType: row.itemType,
        };
      });
  
    console.log(result);
  
    return result[0];
  };



export { getAllItems, getItem};