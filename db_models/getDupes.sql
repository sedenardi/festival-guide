delimiter $$
create procedure getDupes()
begin

drop table if exists matches;
create temporary table matches
(
	artistId1 int,
	artistId2 int,
	matches int
);

insert into matches(artistId1,artistId2,matches)
select 
	h1.artistId,
	h2.artistId,
	count(1) as matches
from hashes h1
	inner join hashes h2
		on h1.hash = h2.hash
		and h1.artistId < h2.artistId
where not exists
	(select 1 from falsepositives fp
	where fp.artistId1 = h1.artistId
	and fp.artistId2 = h2.artistId)
group by h1.artistId,h2.artistId
having count(1) > 1;

create index ix_matches1 on matches(artistId1);
create index ix_matches2 on matches(artistId2);

select 
	m.artistId1,
	a1.artist as artist1,
	(select count(1) from appearances app where app.artistId = m.artistId1) as artist1Appearances,
	m.artistId2,
	a2.artist as artist2,
	(select count(1) from appearances app where app.artistId = m.artistId2) as artist2Appearances,
	matches,
	(select count(1) from hashes h where h.artistId = m.artistId1) - matches + 
	(select count(1) from hashes h where h.artistId = m.artistId2) - matches as diff
from matches m
	inner join artists a1
		on a1.artistId = m.artistId1
	inner join artists a2
		on a2.artistId = m.artistId2
order by diff asc limit 100;

end $$
delimiter ;
