set @festivalId = 16;

delete a from appearances a where exists
  (select 1 from festivalDates fd where fd.festivalId = @festivalId
  and fd.festivalDateId = a.festivalDateId);
delete from festivalDates where festivalId = @festivalId;
delete from festivals where festivalId = @festivalId;
delete l from locations l where not exists
  (select 1 from festivals f where l.locationId = f.locationId);