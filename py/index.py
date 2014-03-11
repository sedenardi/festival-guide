#!/usr/local/bin/python

import pystache
renderer = pystache.Renderer()
print ("Content-type: text/html")
print ("")
print (renderer.render_path('views/index.mustache'))