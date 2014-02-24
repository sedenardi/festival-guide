delimiter $$
create procedure markFalsePositive(
	in artistId1 int,
	in artistId2 int
)
begin

insert into falsePositives(artistId1,artistId2)
values (artistId1,artistId2);

end $$
delimiter ;