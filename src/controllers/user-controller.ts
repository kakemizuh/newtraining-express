import { Response, Request, NextFunction } from "express";
import { getAllUsers, getUser, createUser, updateUser, deleteUser, addItem, useItem, useGacha} from "../services/user-service";
import { dbPool, transactionHelper } from "../helpers/db-helper";
import { User } from "../interfaces/user";
import { Item } from "../interfaces/item";
import { UserItem } from "../interfaces/useritem";
export class UserController {
  /**
   * usersテーブルのレコードを全件取得する
   * @param req 
   * @param res 
   * @param next 
   */
  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const dbConnection = await dbPool.getConnection();
    try {
      const result = await getAllUsers(dbConnection);
      res.status(200);
      res.json(result);
    } catch (e) {
      next(e);
    } finally {
      dbConnection.release(); 
    }
  }

  /**
   * usersテーブルからidで指定したレコードを１件取得する
   * @param req 
   * @param res 
   * @param next 
   */
  async getUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const dbConnection = await dbPool.getConnection();
    try {
      const result = await getUser(Number(req.params.id),dbConnection);
      res.status(200);
      res.json(result);
    } catch (e) {
      next(e);
    } finally {
      dbConnection.release(); 
    }
  }

  /**
   * usersテーブルに新しいレコードを追加し、idを返す
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (
      !req.body.name ||
      !req.body.password ||
      !req.body.money ||
      !req.body.hp ||
      !req.body.mp
    ) {
      res.status(400).json({ message: "Invalid parameters or body." });
      return;
    }

    const user: User = {
      name: req.body.name,
      password: req.body.password,
      money: req.body.money,
      hp: req.body.hp,
      mp: req.body.mp,
    };

    const dbConnection = await dbPool.getConnection();
    try {
      await dbConnection.beginTransaction();
      let result: number;
      result = await createUser(user, dbConnection);
      await dbConnection.commit();
      res.status(200).json({ id: result! });
    } catch (e) {
      await dbConnection.rollback();
      next(e);
    } finally {
      dbConnection.release(); 
    }
  }

  /**
   * idで指定したusersテーブルのレコードをリクエストボディの値で更新する
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async updateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (
      !req.body.name ||
      !req.body.password ||
      !req.body.money ||
      !req.body.hp ||
      !req.body.mp
    ) {
      res.status(400).json({ message: "Invalid parameters or body." });
      return;
    }

    const user: User = {
      name: req.body.name,
      password: req.body.password,
      money: req.body.money,
      hp: req.body.hp,
      mp: req.body.mp,
    };

    const dbConnection = await dbPool.getConnection();
    try {
      await dbConnection.beginTransaction(); 
      await updateUser(Number(req.params.id), user, dbConnection);

      await dbConnection.commit();
      res.status(200);
      res.json({message:"success"});
    } catch (e) {
      await dbConnection.rollback();
      next(e);
    } finally {
      dbConnection.release(); 
    }
  }

  /**
   * idで指定したusersテーブルのレコードを削除する
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async deleteUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if(isNaN(Number(req.params.id))){
      res.status(400).json({ message: "error:id not number" });
      return;
    }

    const dbConnection = await dbPool.getConnection();
    try {
      await dbConnection.beginTransaction();
      let result:string = "";
      await deleteUser(Number(req.params.id), dbConnection);
      await dbConnection.commit();
      res.status(200).json({ message: "success" });
    } catch (e) {
      await dbConnection.rollback();
      next(e);
    } finally {
      dbConnection.release(); 
    }
  }

  /**
   * idで指定したプレイヤーのアイテムを増加させる
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async addItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId: number = Number(req.params.id);
    const itemId: number = req.body.itemId;
    const count: number = req.body.count;
    //useridが数字であるかチェック
    if(isNaN(userId)){
      res.status(400).json({ message: "error:userid not number" });
      return;
    }
    //リクエストボディに必要な値があるかチェック
    if (
      !itemId ||
      !count
    ) {
      res.status(400).json({ message: "Invalid parameters or body." });
      return;
    }
    //itemidが数字であるかチェック
    if(isNaN(itemId)){
      res.status(400).json({ message: "error:itemid not number" });
      return;
    }
    //countが数字であるかチェック
    if(isNaN(count)){
      res.status(400).json({ message: "error:count not number" });
      return;
    }

    const adduseritem: UserItem = {
      userId: userId,
      itemId: itemId,
      itemCount: count,
    };

    const dbConnection = await dbPool.getConnection();
    try {
      await dbConnection.beginTransaction(); 

      //アイテムを増加
      const result = await addItem(adduseritem, dbConnection);

      await dbConnection.commit();
      res.status(200);
      res.json({itemid:itemId, count:result});
    } catch (e) {
      await dbConnection.rollback();
      next(e);
    } finally {
      dbConnection.release(); 
    }
  }

  /**
   * 指定したアイテムを使用し、効果によってプレイヤーのステータスを更新する
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  async useItem(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userid: number = Number(req.params.id);
    const itemid: number = req.body.itemId;
    const count: number = req.body.count;

    //useridが数字であるかチェック
    if(isNaN(userid)){
      res.status(400).json({ message: "error:id not number" });
      return;
    }
    //リクエストボディに必要な値があるかチェック
    if (
      !itemid ||
      !count
    ) {
      res.status(400).json({ message: "Invalid parameters or body." });
      return;
    }
    //itemidが数字であるかチェック
    if(isNaN(itemid)){
      res.status(400).json({ message: "error:itemid not number" });
      return;
    }
    //countが数字であるかチェック
    if(isNaN(count)){
      res.status(400).json({ message: "error:count not number" });
      return;
    }
    const dbConnection = await dbPool.getConnection();
    try {
      //アイテムを使用
      const result = await useItem(userid, itemid, count, dbConnection);
      
      await dbConnection.commit();
      res.status(200);
      res.json(result);
    } catch (e) {
      await dbConnection.rollback();
      next(e);
    } finally {
      dbConnection.release(); 
    }
  }
  /**
   * countの回数ガチャを引き、結果手に入れたアイテムを加算する
   * @param req 
   * @param res 
   * @param next 
   * @returns Response
   */
  async useGacha(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const userId: number = Number(req.params.id);
    const count: number = req.body.count;
    if(isNaN(userId)){
      res.status(400).json({ message: "error:id not number" });
      return;
    }
    //リクエストボディに必要な値があるかチェック
    if (
      !count
    ) {
      res.status(400).json({ message: "Invalid parameters or body." });
      return;
    }
    //countが数字であるかチェック
    if(isNaN(count)){
      res.status(400).json({ message: "error:count not number" });
      return;
    }

    const dbConnection = await dbPool.getConnection();
    try {
      await dbConnection.beginTransaction();
      

      const result = await useGacha(userId, count, dbConnection);
      await dbConnection.commit();
      res.status(200).json(result);
    } catch (e) {
      await dbConnection.rollback();
      next(e);
    } finally {
      dbConnection.release(); 
    }
  }

  

  /**
   * next(err)を投げるとapp.tsでエラーハンドリングできます。
   * https://expressjs.com/ja/guide/error-handling.html
   */
  errorResponse(req: Request, res: Response, next: NextFunction) {
    next(new Error("エラー発生"));
  }
}
