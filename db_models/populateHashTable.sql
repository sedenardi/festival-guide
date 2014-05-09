DELIMITER $$
create procedure populateHashTable()
begin

declare windowSize int;
declare idx int;
set windowSize = 4;
set idx = 1;

drop table if exists sanitized;
create temporary table sanitized
(
	artistId int,
	artist varchar(300)
);

insert into sanitized(artistId,artist)
select 
	a.artistId,
	replace(replace(replace(replace(replace(replace(LOWER(a.artist),'the ',''),'a ',''),'.',''),'& ',''),'and ',''),'-','')
from artists a
where not exists
	(Select 1 from hashes h
	where h.artistId = a.artistId);

Insert into hashes(artistId,hash)
select 
	artistId,
	artist
from sanitized
where CHAR_LENGTH(artist) < (windowSize);


Insert into hashes(artistId,hash)
select
	artistId,
	substr(artist,idx,windowSize)
from sanitized
where char_length(substr(artist,idx,windowSize)) >= (windowSize);

while row_count() > 0 do
	set idx = idx + 1;

	insert into hashes(artistId,hash)
	select
		artistId,
		substr(artist,idx,windowSize)
	from sanitized
	where char_length(substr(artist,idx,windowSize)) >= (windowSize);
end while;

end $$
DELIMITER ;
