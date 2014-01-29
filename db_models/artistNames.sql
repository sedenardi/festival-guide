CREATE TABLE `artistnames` (
  `artistNameId` INT(11) NOT NULL AUTO_INCREMENT,
  `artistId` INT(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`artistNameId`),
  INDEX `FK_artistnames_artistId` (`artistId`),
  CONSTRAINT `FK_artistnames_artistId` FOREIGN KEY (`artistId`) REFERENCES `artists` (`artistId`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB;
