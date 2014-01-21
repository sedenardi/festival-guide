Select
(select count(1) from appearances where festivalId = 1) as count_coachella,
(select count(1) from appearances where festivalId = 4) as count_govball,
(select count(1) from appearances where festivalId = 3) as count_firefly,
(select count(1) from appearances a1 where a1.festivalId = 1
	and exists (select 1 from appearances a2
	where a2.festivalId = 4 and a1.artistId = a2.artistId)) as coach_gov,
(select count(1) from appearances a1 where a1.festivalId = 1
	and exists (select 1 from appearances a2
	where a2.festivalId = 3 and a1.artistId = a2.artistId)) as coach_fly,
(select count(1) from appearances a1 where a1.festivalId = 4
	and exists (select 1 from appearances a2
	where a2.festivalId = 3 and a1.artistId = a2.artistId)) as gov_fly,
(select count(1) from appearances a1 where a1.festivalId = 4
	and exists (select 1 from appearances a2
	where a2.festivalId = 3 and a1.artistId = a2.artistId)
	and exists (select 1 from appearances a2
	where a2.festivalId = 1 and a1.artistId = a2.artistId)) as all3;