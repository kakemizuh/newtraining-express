/* Replace with your SQL commands */
CREATE TABLE `userItems` (
  `userId` INT(11) UNSIGNED NOT NULL COMMENT "ユーザーID",
  `itemId` INT(11) UNSIGNED NOT NULL COMMENT "アイテムID",
  `itemCount` INT(11) UNSIGNED NOT NULL COMMENT "アイテム所持数",
  PRIMARY KEY (`userId`,`itemId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;