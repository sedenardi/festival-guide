call populateHashTable();

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
group by h1.artistId,h2.artistId
having count(1) > 1
order by matches desc;

select 
	m.artistId1,
	a1.artist,
	m.artistId2,
	a2.artist,
	matches
from matches m
	inner join artists a1
		on a1.artistId = m.artistId1
	inner join artists a2
		on a2.artistId = m.artistId2;