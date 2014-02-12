SET @festivalId = 6; SET @setTime = '2014-04-25';

drop table if exists a;
create temporary table a 
(
	artist varchar(300)
);

insert into a(artist)
VALUES('Santana'),('The Avett Brothers'),('Public Enemy'),('Jason Isbell'),('Rubén Blades & Roberto Delgado Orchestra'),('Laura Mvula'),('Irvin Mayfield & the New Orleans Jazz Orchestra'),('Gregory Porter'),('The Infamous Stringdusters'),('Eric Lindell and the Sunliners, feat. Anson Funderburgh'),('Joe Louis Walker'),('Wayne Toups & ZyDeCajun'),('Afoxé Omô Nilê Ogunjá of Pernambuco-Brazil'),('Steve Riley & the Mamou Playboys'),('Dee-1'),('Nathan & the Zydeco Cha Chas'),('Shamarr Allen & the Underdawgs'),('Honey Island Swamp Band'),('Little Freddie King Blues Band'),('Brass-A-Holics'),('Leah Chase'),('Geno Delafose & French Rockin’ Boogie'),('Sasha Masakowski'),('Lisa Knowles & the Brown Singers'),('BaianaSystem of Bahia-Brazil'),('Chris Thomas King'),('Tim Laughlin'),('Tricia Boutté & International Friends'),('Gal Holiday and the Honky Tonk Revue'),('Lil’ Buck Sinegal Blues Band'),('Shades of Praise'),('Curtis Pierre & Escola de Samba Casa Samba'),('Ginga Mundo Capoeira of Bahia-Brazil with special guests'),('Connie and Dwight Fitch with St. Raymond & St. Leo the Great Gospel Choir'),('Rotary Downs'),('Javier Gutierrez & Vivaz!'),('Bamboula 2000'),('J. Monque’D Blues Band'),('Alexey Marti & Urban Minds'),('Jimmy Breaux & Friends'),('Aurora Nealand & The Royal Roses'),('Brice Miller & Mahogany Brass Band'),('Vox and the Hound'),('Jaryd Lane & The Parish'),('Julio y Cesar Band'),('Jamil Sharif'),('Betty Winn & One A-Chord'),('Stoney Creek Drum and Dance'),('Semolian Warriors Mardi Gras Indians'),('Comanche Hunters Mardi Gras Indians'),('Kirk Joseph’s Backyard Groove'),('Baritone Bliss'),('Maryland Jazz Band of Cologne - Germany'),('Chris Clifton & His All-Stars'),('Sweet Olive String Band'),('The Real Untouchable Brass Band'),('Zulu Social Aid & Pleasure Club'),('Big Nine Social Aid & Pleasure Club'),('David & Roselyn'),('The Showers'),('Tommy Singleton'),('Young Audiences Brass Band Throwdown'),('Black Mohawk Mardi Gras Indians'),('Black Foot Hunters Mardi Gras Indians'),('The RAMS'),('The Sensational Chosen Voices'),('Keep N It Real Social Aid & Pleasure Club'),('We Are One Social Aid & Pleasure Club'),('City of Love Music & Worship Arts Choir'),('Xavier University Jazz Ensemble'),('Wild Apaches Mardi Gras Indians'),('Geronimo Hunters Mardi Gras Indians'),('Lake Forest Charter Jazz Band'),('GrayHawk presents Native Lore and Tales'),('Miss Claudia’s Terrific Traveling Troubadours'),('KCCA Drama Troupe');

Insert into artists(artist)
select artist
from a
where not exists
	(select 1 from artists
	where a.artist like artists.artist);
	
insert into appearances(artistId,festivalId,setTime)
select 
	artistId,
	@festivalId,
	@setTime
from artists
where exists
	(Select 1 from a
	where a.artist = artists.artist);