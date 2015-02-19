set @city := 'Chicago',
   @state := 'IL',
   @country := 'USA',
   @festival := 'Pitchfork',
   @website := 'www.pitchforkmusicfestival.com',
   @startDate := '2015-07-17',
   @endDate := '2015-07-19';

insert into locations(city,state,country)
select * from (select @city as city,@state as state,@country as country) t1
where not exists
  (select 1 from locations t2
  where t2.city like t1.city 
  and t2.state like t1.state
  and t2.country like t1.country);

insert into festivals(festival,locationId,website)
select festival,locationId,website
from (select @festival as festival,@website as website) t1
  inner join locations l
    on l.city like @city
    and l.state like @state
    and l.country like @country
where not exists
  (select 1 from festivals t2
  where t2.festival like t1.festival
  and t2.website like t1.website);

insert into festivalDates(festivalId,week,startDate,endDate)
select festivalId,null,startDate,endDate
from (select @startDate as startDate,@endDate as endDate) t1
  inner join festivals f
    on f.festival like @festival
    and f.website like @website
where not exists
  (select 1 from festivalDates t2
  where t2.festivalId = f.festivalId
  and t2.startDate = t1.startDate
  and t2.endDate = t1.endDate);

select * from festivalDates fd
  inner join festivals f
    on f.festivalId = fd.festivalId
  inner join locations l
    on l.locationId = f.locationId
where f.festival like @festival;
