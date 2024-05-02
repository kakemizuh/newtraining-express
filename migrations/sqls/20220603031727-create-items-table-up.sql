/* Replace with your SQL commands */
CREATE TABLE items (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT "アイテムID",
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT "アイテム名",
  `heal` int(11) unsigned NOT NULL COMMENT "回復量",
  `price` int(11) unsigned NOT NULL COMMENT "値段",
  `percent` int(11) unsigned NOT NULL COMMENT "確率",
  `itemType` int(11) unsigned NOT NULL COMMENT "アイテムタイプ",
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
