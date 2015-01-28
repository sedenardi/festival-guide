insert into locations(venue,city,state,country)
select 'Empire Polo Club','Indio','CA','USA';

select * from locations;

insert into festivals(festival,locationId,website)
select 'Coachella',1,'www.coachella.com';

select * from festivals;

insert into festivalDates(festivalId,week,startDate,endDate)
select 1,1,'2015-04-10','2015-04-12'
union all select 1,2,'2015-04-17','2015-04-19';

select * from festivalDates;