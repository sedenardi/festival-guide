drop table if exists a;
create temporary table a 
(
	appearanceId int
);

insert into a
select a1.appearanceId
from appearances a1
where exists
	(Select 1 from appearances a2
	where a1.artistId = a2.artistId
	and a1.festivalId = a2.festivalId
	and a1.appearanceId > a2.appearanceId);
	
delete from appearances
where exists
	(Select 1 from a
	where a.appearanceId = appearances.appearanceId);