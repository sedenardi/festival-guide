CREATE TABLE `falsepositives` (
	`artistId1` INT(11) NOT NULL,
	`artistId2` INT(11) NOT NULL,
	UNIQUE INDEX `artistId1_artistId2` (`artistId1`, `artistId2`),
	INDEX `FK_falsePositives_artistId2` (`artistId2`),
	CONSTRAINT `FK_falsePositives_artistId1` FOREIGN KEY (`artistId1`) REFERENCES `artists` (`artistId`),
	CONSTRAINT `FK_falsePositives_artistId2` FOREIGN KEY (`artistId2`) REFERENCES `artists` (`artistId`)
)
COLLATE='utf8_general_ci'
ENGINE=InnoDB;
