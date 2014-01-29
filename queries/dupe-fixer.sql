drop temporary table if exists dupes;
create temporary table dupes ( artistId int );

Insert into dupes(artistId)
Select artistId from artists
where artistId in ();

set @lowId = 0;

select artistId from dupes 
order by artistId asc limit 1 
into @lowId;

Insert into artistNames(artistId,name)
select distinct @lowId,a.artist
from artists a
where exists
  (Select 1 from dupes d
  where d.artistId = a.artistId);

update appearances a
set a.artistId = @lowId
where exists
  (select 1 from dupes d
  where d.artistId = a.artistId);
  
delete a from artists a
where exists
  (Select 1 from dupes d
  where d.artistId = a.artistId)
and a.artistId <> @lowId;