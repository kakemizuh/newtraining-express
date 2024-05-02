import * as userModel from "../models/user-model";
import * as itemModel from "../models/item-model";
import * as userItemModel from "../models/useritem-model";
import { User } from "../interfaces/user";
import { Item } from "../interfaces/item";
import { UserItem } from "../interfaces/useritem";
import { PoolConnection } from "mysql2/promise";

/**
 * usersテーブルのレコードを全件取得する
 * @param dbConnection 
 * @returns User[]
 */
const getAllUsers = async (dbConnection: PoolConnection): Promise<User[]> => {
  const result = await userModel.getAllUsers(dbConnection);
  return result;
};

/**
 * idで指定したプレイヤーのレコードを取得する
 * @param id 
 * @param dbConnection 
 * @returns User
 */
const getUser = async (
  id: number,
  dbConnection: PoolConnection
): Promise<User> => {
  const result: User = await userModel.getUser(id, dbConnection);
  return result;
}
/**
 * usersテーブルにレコードを新規作成し、idを返す
 * @param data 
 * @param dbConnection 
 * @returns 新規プレイヤーのid
 */
const createUser = async (
  data: User,
  dbConnection: PoolConnection
): Promise<number> => {
  const result: number = await userModel.createUser(data, dbConnection);
  return result;
};
/**
 * idで指定したプレイヤーのレコードをdataで更新する
 * @param id 
 * @param data 
 * @param dbConnection 
 */
const updateUser = async (
  id: number,
  data: User,
  dbConnection: PoolConnection
): Promise<void> => {
  await userModel.updateUser(id, data, dbConnection);
}
/**
 * idで指定したプレイヤーのレコードを削除する
 * @param id 
 * @param dbConnection 
 */
const deleteUser = async (
  id: number,
  dbConnection: PoolConnection
): Promise<void> => {
  await userModel.deleteUser(id, dbConnection);
}
/**
 * idで指定したプレイヤーのアイテムを増加させる
 * @param addUserItem 
 * @param dbConnection 
 * @returns number 増加後のアイテム数
 */
const addItem = async (
  addUserItem: UserItem,
  dbConnection: PoolConnection
): Promise<number> => {
  //userデータの存在チェック
  const userData = await userModel.getUser(addUserItem.userId!, dbConnection);
  if(userData === undefined){
    throw new Error("no userData");
  }
  //itemデータの存在チェック
  const itemData = await itemModel.getItem(addUserItem.itemId!, dbConnection);
  if(itemData === undefined){
    throw new Error("no itemData");
  }
  let result = addUserItem.itemCount!;
  //userItemデータの存在チェック
  let userItemData = await userItemModel.getUserItem(addUserItem, dbConnection);
  if(userItemData === undefined){
    //レコードが存在しない場合作成する
    await userItemModel.createUserItem(addUserItem, dbConnection);
  }
  else {
    //アイテムを増加させる
    userItemData.itemCount! += addUserItem.itemCount!;
    await userItemModel.updateUserItem(userItemData, dbConnection);
    result = userItemData.itemCount!;
  }
  //増加後のアイテム数を返す
  return result;
}

/**
 * 指定したアイテムを使用し、効果によってプレイヤーのステータスを更新する
 * @param userId 
 * @param itemId 
 * @param count 
 * @param dbConnection 
 * @returns プレイヤーの現在のステータスと残りの所持数
 */
const useItem = async (
  userId: number,
  itemId: number,
  count: number,
  dbConnection: PoolConnection
): Promise<any> => {
  const STATUS_MAX_VALUE: number = 200;
  const ITEMTYPE_HP_POTION: number = 1;
  const ITEMTYPE_MP_POTION: number = 2;
  const useUserItem: UserItem = {
    userId: userId,
    itemId: itemId,
    itemCount: count,
  };
  //userデータの存在チェック
  const userData = await userModel.txGetUser(userId, dbConnection);
  if(userData === undefined){
    throw new Error("no userData");
  }
  //itemデータの存在チェック
  const itemData = await itemModel.getItem(itemId, dbConnection);
  if(itemData === undefined){
    throw new Error("no itemData");
  }
  //itemtypeによってステータスを格納
  let status: number = 0;
  if(itemData.itemType === ITEMTYPE_HP_POTION){
    status = userData.hp!;
  }
  else if(itemData.itemType === ITEMTYPE_MP_POTION){
    status = userData.mp!;
  }
  //userItemデータの存在チェック
  let userItemData = await userItemModel.getUserItem(useUserItem, dbConnection);
  if(userItemData === undefined){
    throw new Error("no item");
  }
  //アイテムが足りているかチェック
  if(userItemData.itemCount! < useUserItem.itemCount!){
    throw new Error("not enough item");
  }

  //アイテムを使用する個数を判定
  //プレイヤーに指定された個数を使用すると、最大値を超えてしまう場合
  let useItemCount: number = 0;
  for(let i = 0; i < count; i++){
    useItemCount++;
    if(itemData.heal! + status >= STATUS_MAX_VALUE){

      //使用後ステータスが最大値を超えた場合ステータスに200を入れる
      status = STATUS_MAX_VALUE;
      break;
    }
    status += itemData.heal!;
  }
  //元の所持数から使用した分を引く
  userItemData.itemCount! -= useItemCount;

  //算出したステータスの値を、アイテムタイプによって決まるステータスに格納
  if(itemData.itemType === ITEMTYPE_HP_POTION){
    userData.hp = status;
  }
  else if(itemData.itemType === ITEMTYPE_MP_POTION){
    userData.mp = status;
  }

  //userItemデータの値を更新する
  //0個になった場合はテーブルを削除する
  if(userItemData.itemCount === 0){
    await userItemModel.deleteUserItem(userItemData.userId!, userItemData.itemId!, dbConnection);
  }
  else{
    userItemModel.updateUserItem(userItemData, dbConnection);
  }

  //userデータの値を更新する
  await userModel.updateUser(userData.id!, userData, dbConnection);

  const result = {
    itemId:itemData.id!, count:userItemData.itemCount!,
    player:{id:userData.id!, hp:userData.hp!, mp:userData.mp!}
  };

  return result;
}
/**
 * countの回数ガチャを引き、結果手に入れたアイテムを加算する
 * @param userId 
 * @param count 
 * @param dbConnection 
 * @returns ガチャの結果
 */
const useGacha = async (
  userId: number,
  count: number,
  dbConnection: PoolConnection
): Promise<any> => {
  const PRICE: number = 10;
  //userデータの存在チェック
  const userData = await userModel.txGetUser(userId, dbConnection);
  if(userData === undefined){
    throw new Error("no userData");
  }
  //ガチャに使用するお金が足りているかチェック
  if(userData.money! < PRICE * count){
    throw new Error("no money");
  }
  //itemデータの存在チェック
  const Items:Item[] = await itemModel.getAllItems(dbConnection);
  if(Items.length === 0){
    throw new Error("no itemData");
  }
  let percentNum = 0;
  Items.forEach((item) => {
    percentNum = percentNum + item.percent!;
  });

  let results: number[] = [];

  //ガチャ
  for (let i = 0; i < count; i++){
    const gachaRand = Math.floor(Math.random() * (100 + 1 - 1)) + 1;
    let totalPercent = 0;
    for(let j = 0; j < Items.length; j++){
      totalPercent += Items[j].percent!;
      if(gachaRand <= totalPercent){
        if(results[Items[j].id!] !== undefined){
          results[Items[j].id!]++;
        }
        else{
          results[Items[j].id!] = 1;
        }
        break;
      }
    }
  }

  //プレイヤーのデータ（所持金）を更新する
  userData.money! -= PRICE * count;
  await userModel.updateUser(userData.id!, userData, dbConnection);

  //結果格納用の配列を宣言
  let resultJson: any[] = [];
  let itemJson: any[] = [];

  //更新
  for(const item of Items){
    //アイテムが排出されていたとき
    if(results[item.id!] > 0){
      let newUserItem: UserItem = {
        userId: userData.id,
        itemId: item.id,
        itemCount: results[item.id!],
      }
      let UserItem = await userItemModel.getUserItem(newUserItem, dbConnection);
      //レコードがない場合作成する
      if(UserItem === undefined){
        userItemModel.createUserItem(newUserItem, dbConnection);
        resultJson.push({itemId:item.id,count:results[item.id!]});
        itemJson.push({itemId:item.id,count:results[item.id!]});
      }
      //レコードがある場合ガチャの結果分増加させ更新する
      else{ 
        newUserItem.itemCount! += UserItem.itemCount!;
        userItemModel.updateUserItem(newUserItem, dbConnection);
        resultJson.push({itemId:UserItem.itemId,count:results[item.id!]});
        itemJson.push({itemId:UserItem.itemId,count:newUserItem.itemCount});
        }
      };
    }

  const result = {
    results:resultJson,
    player:{money:userData.money!, items:itemJson}
  };

  return result;
}

export { getAllUsers, getUser, createUser, updateUser ,deleteUser, addItem, useItem, useGacha};
