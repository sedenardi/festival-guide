delimiter $$
create procedure fixDupe(
	in artistId1 int,
	in artistId2 int
)
begin

update appearances
set artistId = artistId1
where artistId = artistId2;
  
delete from artists
where artistId = artistId2;

end $$
delimiter ;