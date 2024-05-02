import * as userModel from "../models/user-model";
import * as itemModel from "../models/item-model";
import * as useritemModel from "../models/useritem-model";
import { User } from "../interfaces/user";
import { Item } from "../interfaces/item";
import { UserItem } from "../interfaces/useritem";
import { PoolConnection } from "mysql2/promise";
import { UserController } from "../controllers";
import { error } from "console";

const getAllUsers = async (dbConnection: PoolConnection): Promise<User[]> => {
  const result = await userModel.getAllUsers(dbConnection);
  return result;
};

const getUser = async (
  id: number,
  dbConnection: PoolConnection
): Promise<User> => {
  const result: User = await userModel.getUser(id, dbConnection);
  return result;
}

const createUser = async (
  data: User,
  dbConnection: PoolConnection
): Promise<number> => {
  const result: number = await userModel.createUser(data, dbConnection);
  return result;
};

const updateUser = async (
  id: number,
  data: User,
  dbConnection: PoolConnection
): Promise<void> => {
  await userModel.updateUser(id, data, dbConnection);
}

const deleteUser = async (
  id: number,
  dbConnection: PoolConnection
): Promise<string> => {
  await userModel.deleteUser(id, dbConnection);
  return "success";
}

const addItem = async (
  adduseritem: UserItem,
  dbConnection: PoolConnection
): Promise<number> => {
  //userデータの存在チェック
  const userdata = await userModel.getUser(adduseritem.userid!, dbConnection);
  if(userdata === undefined){
    throw new Error("no userdata");
  }
  //itemデータの存在チェック
  const itemdata = await itemModel.getItem(adduseritem.itemid!, dbConnection);
  if(itemdata === undefined){
    throw new Error("no itemdata");
  }
  let result = adduseritem.itemcount!;
  //useritemデータの存在チェック
  let useritemdata = await useritemModel.getUserItem(adduseritem, dbConnection);
  if(useritemdata === undefined){
    //レコードが存在しない場合作成する
    await useritemModel.createUserItem(adduseritem, dbConnection);
  }
  else {
    //アイテムを増加させる
    useritemdata.itemcount! += adduseritem.itemcount!;
    await useritemModel.updateUserItem(useritemdata, dbConnection);
    result = useritemdata.itemcount!;
  }
  //増加後のアイテム数を返す
  return result;
}

const useItem = async (
  userid: number,
  itemid: number,
  count: number,
  dbConnection: PoolConnection
): Promise<any> => {
  const STATUS_MAX_VALUE: number = 200;
  const ITEMTYPE_HP_POTION: number = 1;
  const ITEMTYPE_MP_POTION: number = 2;
  const useuseritem: UserItem = {
    userid: userid,
    itemid: itemid,
    itemcount: count,
  };
  //userデータの存在チェック
  const userdata = await userModel.txgetUser(userid, dbConnection);
  if(userdata === undefined){
    throw new Error("no userdata");
  }
  //itemデータの存在チェック
  const itemdata = await itemModel.getItem(itemid, dbConnection);
  if(itemdata === undefined){
    throw new Error("no itemdata");
  }
  //itemtypeによってステータスを格納
  let status: number = 0;
  if(itemdata.itemtype === ITEMTYPE_HP_POTION){
    status = userdata.hp!;
  }
  else if(itemdata.itemtype === ITEMTYPE_MP_POTION){
    status = userdata.mp!;
  }
  //useritemデータの存在チェック
  let useritemdata = await useritemModel.getUserItem(useuseritem, dbConnection);
  if(useritemdata === undefined){
    throw new Error("no item");
  }
  //アイテムが足りているかチェック
  if(useritemdata.itemcount! < useuseritem.itemcount!){
    throw new Error("not enough item");
  }

  //アイテムを使用する個数を判定
  //プレイヤーに指定された個数を使用すると、最大値を超えてしまう場合
  let useitemcount: number = 0;
  for(let i = 0; i < count; i++){
    useitemcount++;
    if(itemdata.heal! + status >= STATUS_MAX_VALUE){

      //使用後ステータスが最大値を超えた場合ステータスに200を入れる
      status = STATUS_MAX_VALUE;
      break;
    }
    status += itemdata.heal!;
  }
  //元の所持数から使用した分を引く
  useritemdata.itemcount! -= useitemcount;

  //算出したステータスの値を、アイテムタイプによって決まるステータスに格納
  if(itemdata.itemtype === ITEMTYPE_HP_POTION){
    userdata.hp = status;
  }
  else if(itemdata.itemtype === ITEMTYPE_MP_POTION){
    userdata.mp = status;
  }

  //useritemデータの値を更新する
  //0個になった場合はテーブルを削除する
  if(useritemdata.itemcount === 0){
    await useritemModel.deleteUserItem(useritemdata.userid!, useritemdata.itemid!, dbConnection);
  }
  else{
    useritemModel.updateUserItem(useritemdata, dbConnection);
  }

  //userデータの値を更新する
  await userModel.updateUser(userdata.id!, userdata, dbConnection);

  const result = {
    itemid:itemdata.id!, count:useritemdata.itemcount!,
    player:{id:userdata.id!, hp:userdata.hp!, mp:userdata.mp!}
  };

  return result;
}

const useGacha = async (
  userid: number,
  count: number,
  PRICE: number,
  dbConnection: PoolConnection
): Promise<any> => {
  //userデータの存在チェック
  const userdata = await userModel.txgetUser(userid, dbConnection);
  if(userdata === undefined){
    throw new Error("no userdata");
  }
  //ガチャに使用するお金が足りているかチェック
  if(userdata.money! < PRICE * count){
    throw new Error("no money");
  }
  //itemデータの存在チェック
  const Items:Item[] = await itemModel.getAllItems(dbConnection);
  if(Items.length === 0){
    throw new Error("no itemdata");
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
  userdata.money! -= PRICE * count;
  await userModel.updateUser(userdata.id!, userdata, dbConnection);

  //結果格納用の配列を宣言
  let resultjson: any[] = [];
  let itemjson: any[] = [];

  //更新
  for(const item of Items){
    //アイテムが排出されていたとき
    if(results[item.id!] > 0){
      let newUserItem: UserItem = {
        userid: userdata.id,
        itemid: item.id,
        itemcount: results[item.id!],
      }
      let UserItem = await useritemModel.getUserItem(newUserItem, dbConnection);
      //レコードがない場合作成する
      if(UserItem === undefined){
        useritemModel.createUserItem(newUserItem, dbConnection);
        resultjson.push({itemid:item.id,count:results[item.id!]});
        itemjson.push({itemid:item.id,count:results[item.id!]});
      }
      //レコードがある場合ガチャの結果分増加させ更新する
      else{ 
        newUserItem.itemcount! += UserItem.itemcount!;
        useritemModel.updateUserItem(newUserItem, dbConnection);
        resultjson.push({itemid:UserItem.itemid,count:results[item.id!]});
        itemjson.push({itemid:UserItem.itemid,count:newUserItem.itemcount});
        }
      };
    }

  const result = {
    results:resultjson,
    player:{money:userdata.money!, items:itemjson}
  };

  return result;
}

export { getAllUsers, getUser, createUser, updateUser ,deleteUser, addItem, useItem, useGacha};
