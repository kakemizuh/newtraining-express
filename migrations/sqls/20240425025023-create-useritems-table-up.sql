/* Replace with your SQL commands */
CREATE TABLE `useritems` (
  `userid` INT(11) UNSIGNED NOT NULL COMMENT "ユーザーID",
  `itemid` INT(11) UNSIGNED NOT NULL COMMENT "アイテムID",
  `itemcount` INT(11) UNSIGNED NOT NULL COMMENT "アイテム所持数",
  PRIMARY KEY (`userid`,`itemid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;