import { PoolConnection } from "mysql2/promise";
import { User } from "../interfaces/user";
import { RowDataPacket, OkPacket } from "mysql2";

/**
 * プレイヤーの情報を全件取得する
 * 
 * @param dbConnection 
 * @returns User[]
 */
const getAllUsers = async (dbConnection: PoolConnection): Promise<User[]> => {
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    "SELECT * FROM `users`;"
  );

  const result: User[] = rows.map((row) => {
    return {
      id: row.id,
      name: row.name,
      password: row.password,
      money: row.money,
      hp: row.hp,
      mp: row.mp,
    };
  });
  return result;
};
/**
 * 指定したuseridのレコードを１件取得する
 * @param req 
 * @param dbConnection 
 * @returns User
 */
const getUser = async (
  req: number,
  dbConnection: PoolConnection
): Promise<User> => {
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    "SELECT * FROM `users` WHERE `id` = ?;",
    [req]
  );

  const result: User[] = rows.map((row) => {
    return {
    id: row.id,
    name: row.name,
    password: row.password,
    money: row.money,
    hp: row.hp,
    mp: row.mp,
    };
  });

  return result[0];
};
/**
 * 指定したuseridのレコードを１件取得し、行ロックをかける
 * @param req 
 * @param dbConnection 
 * @returns User
 */
const txGetUser = async (
  req: number,
  dbConnection: PoolConnection
): Promise<User> => {
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    "SELECT * FROM `users` WHERE `id` = ? FOR UPDATE;",
    [req]
  );

  const result: User[] = rows.map((row) => {
    return {
    id: row.id,
    name: row.name,
    password: row.password,
    money: row.money,
    hp: row.hp,
    mp: row.mp,
    };
  });

  return result[0];
};

/**
 * 新規プレイヤーのレコードを作成し、idを返す
 * 
 * @param data 
 * @param dbConnection 
 * @returns 新規プレイヤーのid
 */
const createUser = async (
  data: User,
  dbConnection: PoolConnection
): Promise<number> => {
  const [rows] = await dbConnection.query<OkPacket>(
    "INSERT INTO `users` (`name`, `password`, `money`, `hp`, `mp`) VALUES (?,?,?,?,?);",
    [data.name, data.password, data.money, data.hp, data.mp]
  );

  return rows.insertId;
};
/**
 * 指定したuseridのレコードを更新する
 * @param req 
 * @param data 
 * @param dbConnection 
 */
const updateUser = async (
  req: number,
  data: User,
  dbConnection: PoolConnection
): Promise<void> => {
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    "UPDATE `users` SET `name` = ?, `password` = ?, `money` = ?, `hp` = ?, `mp` = ? WHERE `id` = " + req + ";",
    [data.name, data.password, data.money, data.hp, data.mp]
  );
};
/**
 * 指定したuseridのレコードを削除する
 * @param req 
 * @param dbConnection 
 */
const deleteUser = async (
  req: number,
  dbConnection: PoolConnection
): Promise<void> => {
  const [rows] = await dbConnection.query<OkPacket>(
    "DELETE FROM `users` WHERE `id` = ?;",
    [req]
  );
};

export { getAllUsers, getUser, txGetUser, createUser, updateUser, deleteUser};
