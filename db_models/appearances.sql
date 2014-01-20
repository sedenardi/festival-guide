CREATE TABLE IF NOT EXISTS `appearances` (
  `appearanceId` int(11) NOT NULL AUTO_INCREMENT,
  `artistId` int(11) NOT NULL,
  `festivalId` int(11) NOT NULL,
  `setTime` datetime DEFAULT NULL,
  `stage` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`appearanceId`),
  KEY `FK_appearances_artistId` (`artistId`),
  KEY `FK_appearances_festivalId` (`festivalId`),
  CONSTRAINT `FK_appearances_artistId` FOREIGN KEY (`artistId`) REFERENCES `artists` (`artistId`),
  CONSTRAINT `FK_appearances_festivalId` FOREIGN KEY (`festivalId`) REFERENCES `festivals` (`festivalId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
