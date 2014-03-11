import pymysql
import config
import json
import string
from datetime import datetime

def getDB():
  return pymysql.connect(host=config.host, \
    port=config.port, \
    user=config.user, \
    passwd=config.passwd, \
    db=config.db)

def jdate(obj):
  if isinstance(obj,datetime):
    return obj.isoformat()
  else:
    return str(obj)

def query(query):
  conn = getDB()
  cur = conn.cursor()
  cur.execute(query)
  f = [dict((cur.description[i][0], value) \
          for i, value in enumerate(row)) \
        for row in cur.fetchall()]
  cur.close()
  conn.close()
  return json.dumps(f,default=jdate)

def mQuery(queries):
  arr = []
  conn = getDB()
  for q in queries:
    cur = conn.cursor()
    cur.execute(q)
    arr.append([dict((cur.description[i][0], value) \
          for i, value in enumerate(row)) \
        for row in cur.fetchall()])
    cur.close()
  conn.close()
  return json.dumps(arr,default=jdate)