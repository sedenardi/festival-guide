SET @festivalId = 20;

drop table if exists a;
create temporary table a 
(
	artist varchar(300)
);

insert into a(artist)
VALUES('New Order'),('Rise Against'),('Kip Moore'),('Ray LaMontagne'),('Joan Jett & The Blackhearts'),('Nas'),('Brand New'),('The Neighbourhood'),('Fitz And The Tantrums'),('Ludacris'),('Five Finger Death Punch'),('The Fray '),('The Head and the Heart'),('Neon Trees'),('The Airborne Toxic Event'),('Tegan and Sara'),('B.o.B.'),('Robert DeLong'),('Melissa Etheridge'),('Bonnie Raitt'),('Atmosphere'),('Girl Talk'),('REO Speedwagon'),('Ben Harper & Charlie Musselwhite'),('ZZ Ward'),('Umphrey\'s McGee'),('Cheap Trick'),('Walk Off The Earth'),('Ziggy Marley'),('Kongos'),('A Great Big World'),('.38 Special'),('Jake Miller'),('Kool and the Gang'),('Switchfoot'),('Jake Bugg'),('Yonder Mountain String Band'),('Bleachers'),('O.A.R.'),('Timeflies'),('Wailers'),('Los Lonely Boys'),('Scotty McCreery'),('Pentatonix'),('SoMo'),('Blackberry Smoke'),('Rusted Root'),('George Thorogood & The Destroyers'),('DJ Pauly D'),('Kansas'),('Nitty Gritty Dirt Band'),('Trombone Shorty & Orleans Avenue'),('Michael McDonald'),('Clay Walker'),('The Crystal Method'),('Dennis DeYoung: The Music Of Styx'),('Matisyahu'),('Crowder'),('Best Coast'),('Taj Mahal Trio'),('David Nail'),('The Hold Steady'),('Delta Rae'),('Cowboy Mouth'),('Saints of Valory'),('Bombino'),('Kopecky Family Band'),('Moon Taxi'),('St. Lucia'),('The Wild Feathers'),('The James Hunter Six'),('San Fermin'),('Bad Suns'),('Kitten'),('Wild Cub'),('Foy Vance'),('Bruno Mars'),('Aloe Blacc'),('Lady Gaga'),('Brad Paisley'),('Darius Rucker'),('Joel Crouse'),('Outkast'),('Gary Clark Jr.'),('Dave Matthews Band'),('Zac Brown Band'),('Motley Crue'),('Alice Cooper'),('Fall Out Boy'),('Paramore'),('New Politics'),('Usher'),('Bebe Rexha');

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
	where a.artist = artists.artist)
and not exists
	(Select 1 from appearances app
	where app.artistId = artists.artistId
	and app.festivalId = @festivalId);