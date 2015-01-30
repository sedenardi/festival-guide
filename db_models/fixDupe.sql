delimiter $$
create procedure fixDupe(
	in artistId1 int,
	in artistId2 int
)
begin

update artistsReported
set artistId = artistId1
where artistId = artistId2;

update appearances
set artistId = artistId1
where artistId = artistId2;
  
delete from artists
where artistId = artistId2;

end $$
delimiter ;