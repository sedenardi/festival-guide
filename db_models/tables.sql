CREATE TABLE `locations` (
  `locationId` tinyint(4) NOT NULL AUTO_INCREMENT,
  `venue` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(50) NOT NULL,
  `country` varchar(50) NOT NULL,
  `lat` varchar(50) NOT NULL DEFAULT '0',
  `lng` varchar(50) NOT NULL DEFAULT '0',
  PRIMARY KEY (`locationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `festivals` (
  `festivalId` int(11) NOT NULL AUTO_INCREMENT,
  `festival` varchar(50) NOT NULL,
  `locationId` tinyint(4) NOT NULL,
  `website` varchar(100) NOT NULL,
  PRIMARY KEY (`festivalId`),
  KEY `FK_festivals_location` (`locationId`),
  CONSTRAINT `FK_festivals_location` FOREIGN KEY (`locationId`) REFERENCES `locations` (`locationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `festivalDates` (
  `festivalDateId` int(11) NOT NULL AUTO_INCREMENT,
  `festivalId` int(11) NOT NULL,
  `week` tinyint(4) DEFAULT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  PRIMARY KEY (`festivalDateId`),
  KEY `FK_festivalDates_festivalId` (`festivalId`),
  CONSTRAINT `FK_festivalDates_festivalId` FOREIGN KEY (`festivalId`) REFERENCES `festivals` (`festivalId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `artists` (
  `artistId` int(11) NOT NULL AUTO_INCREMENT,
  `artist` varchar(300) NOT NULL,
  PRIMARY KEY (`artistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `artistsReported` (
  `artistReportedId` int(11) NOT NULL AUTO_INCREMENT,
  `artistReported` varchar(300) NOT NULL,
  `artistId` int(11) NULL,
  PRIMARY KEY (`artistReportedId`),
  KEY `FK_artistsReported_artistId` (`artistId`),
  KEY `FK_artistsReported_artistReported` (`artistReported`),
  CONSTRAINT `FK_artistsReported_artistId` FOREIGN KEY (`artistId`) REFERENCES `artists` (`artistId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `appearances` (
  `appearanceId` int(11) NOT NULL AUTO_INCREMENT,
  `artistId` int(11) NOT NULL,
  `festivalDateId` int(11) NOT NULL,
  PRIMARY KEY (`appearanceId`),
  KEY `FK_appearances_artistId` (`artistId`),
  KEY `FK_appearances_festivalDateId` (`festivalDateId`),
  CONSTRAINT `FK_appearances_artistId` FOREIGN KEY (`artistId`) REFERENCES `artists` (`artistId`),
  CONSTRAINT `FK_appearances_festivalDateId` FOREIGN KEY (`festivalDateId`) REFERENCES `festivalDates` (`festivalDateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;