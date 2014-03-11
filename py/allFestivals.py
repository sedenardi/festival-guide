import db

print ("Content-Type: text/json")
print ("")
print (db.query('select * from festivals;'))