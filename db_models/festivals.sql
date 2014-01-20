CREATE TABLE IF NOT EXISTS `festivals` (
  `festivalId` int(11) NOT NULL AUTO_INCREMENT,
  `festival` varchar(50) NOT NULL,
  `week` tinyint(4) DEFAULT NULL,
  `location` varchar(50) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  PRIMARY KEY (`festivalId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
