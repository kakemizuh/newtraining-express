import { PoolConnection } from "mysql2/promise";
import { UserItem } from "../interfaces/useritem";
import { RowDataPacket, OkPacket } from "mysql2";

/**
 * 指定したuserのuseritemの情報を取得する
 * 
 * @param dbConnection 
 * @returns usersテーブルの全レコード
 */
const getUserItems = async (
  userid: number,
  dbConnection: PoolConnection
): Promise<UserItem[]> => {
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    "SELECT * FROM `useritems` WHERE `userid` = ?;",
    [userid]
  );

  const result: UserItem[] = rows.map((row) => {
    return {
      userid: row.id,
      itemid: row.name,
      itemcount: row.password
    };
  });
  return result;
};
/**
 * 指定したuseridとitemidのuseritemデータを取得する
 * @param data 
 * @param dbConnection 
 * @returns 
 */
const getUserItem = async (
    data: UserItem,
    dbConnection: PoolConnection
  ): Promise<UserItem> => {
    const [rows] = await dbConnection.query<RowDataPacket[]>(
      "SELECT * FROM `useritems` WHERE `userid` = ? AND `itemid` = ? LIMIT 1;",
      [data.userid,data.itemid]
    );
  
    const result:UserItem[] = rows.map((row) => {
      return {
        userid: row.userid,
        itemid: row.itemid,
        itemcount: row.itemcount,
      };
    });
  
    return result[0];
  };
  
  /**
   * 新規useritemのレコードを作成し、idを返す
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
      "INSERT INTO `useritems` (`userid`, `itemid`, `itemcount`) VALUES (?,?,?);",
      [data.userid, data.itemid, data.itemcount]
    );
  
    return rows.insertId;
  };
  /**
   * useritemのレコードを更新する
   * @param data 
   * @param dbConnection 
   */
  const updateUserItem = async (
    data: UserItem,
    dbConnection: PoolConnection
  ): Promise<void> => {
    const [rows] = await dbConnection.query<RowDataPacket[]>(
      "UPDATE `useritems` SET `itemcount` = ? WHERE `userid` = ? AND `itemid` = ?;",
      [data.itemcount, data.userid, data.itemid]
    );
  };
  /**
   * 指定したuseridとitemidのuseritemのレコードを削除する
   * @param userid 
   * @param itemid 
   * @param dbConnection 
   */
  const deleteUserItem = async (
    userid: number,
    itemid: number,
    dbConnection: PoolConnection
  ): Promise<void> => {
    const [rows] = await dbConnection.query<OkPacket>(
      "DELETE FROM `useritems` WHERE `userid` = ? AND `itemid` = ?;",
      [userid,itemid]
    );
  };

export { getUserItems, getUserItem, createUserItem, updateUserItem, deleteUserItem};