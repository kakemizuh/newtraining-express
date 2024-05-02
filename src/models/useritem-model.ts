import { PoolConnection } from "mysql2/promise";
import { UserItem } from "../interfaces/useritem";
import { RowDataPacket, OkPacket } from "mysql2";

/**
 * 指定したuserのuserItemの情報を取得する
 * 
 * @param dbConnection 
 * @returns usersテーブルの全レコード
 */
const getUserItems = async (
  userId: number,
  dbConnection: PoolConnection
): Promise<UserItem[]> => {
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    "SELECT * FROM `userItems` WHERE `userId` = ?;",
    [userId]
  );

  const result: UserItem[] = rows.map((row) => {
    return {
      userId: row.id,
      itemId: row.name,
      itemCount: row.password
    };
  });
  return result;
};
/**
 * 指定したuserIdとitemIdのuserItemデータを取得する
 * @param data 
 * @param dbConnection 
 * @returns 
 */
const getUserItem = async (
    data: UserItem,
    dbConnection: PoolConnection
  ): Promise<UserItem> => {
    const [rows] = await dbConnection.query<RowDataPacket[]>(
      "SELECT * FROM `userItems` WHERE `userId` = ? AND `itemId` = ? LIMIT 1;",
      [data.userId,data.itemId]
    );
  
    const result:UserItem[] = rows.map((row) => {
      return {
        userId: row.userId,
        itemId: row.itemId,
        itemCount: row.itemCount,
      };
    });
  
    return result[0];
  };
  
  /**
   * 新規userItemのレコードを作成し、idを返す
   * 
   * @param data 
   * @param dbConnection 
   * @returns 新規プレイヤーのid
   */
  const createUserItem = async (
    data: UserItem,
    dbConnection: PoolConnection
  ): Promise<number> => {
    const [rows] = await dbConnection.query<OkPacket>(
      "INSERT INTO `userItems` (`userId`, `itemId`, `itemCount`) VALUES (?,?,?);",
      [data.userId, data.itemId, data.itemCount]
    );
  
    return rows.insertId;
  };
  /**
   * userItemのレコードを更新する
   * @param data 
   * @param dbConnection 
   */
  const updateUserItem = async (
    data: UserItem,
    dbConnection: PoolConnection
  ): Promise<void> => {
    const [rows] = await dbConnection.query<RowDataPacket[]>(
      "UPDATE `userItems` SET `itemCount` = ? WHERE `userId` = ? AND `itemId` = ?;",
      [data.itemCount, data.userId, data.itemId]
    );
  };
  /**
   * 指定したuserIdとitemIdのuserItemのレコードを削除する
   * @param userId 
   * @param itemId 
   * @param dbConnection 
   */
  const deleteUserItem = async (
    userId: number,
    itemId: number,
    dbConnection: PoolConnection
  ): Promise<void> => {
    const [rows] = await dbConnection.query<OkPacket>(
      "DELETE FROM `userItems` WHERE `userId` = ? AND `itemId` = ?;",
      [userId,itemId]
    );
  };

export { getUserItems, getUserItem, createUserItem, updateUserItem, deleteUserItem};