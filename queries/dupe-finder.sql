select *
from artists a1
where LOWER(SUBSTRING(a1.artist,1,3)) not like 'the'
and exists
	(Select 1 from artists a2
	where LOWER(SUBSTRING(a1.artist,1,4)) = LOWER(SUBSTRING(a2.artist,1,4))
	and a1.artistId <> a2.artistId)
order by 2;