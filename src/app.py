import doctest
import os, io
import pandas as pd
from flask import Flask, jsonify, request
from flask import send_file
from flask_cors import CORS, cross_origin
import json, base64
import time
import pandas as pd    
from difflib import get_close_matches
from meds import medArr
from api import returnOCR



app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def lcs(X, Y):
	# find the length of the strings
	m = len(X)
	n = len(Y)

	# declaring the array for storing the dp values
	L = [[None]*(n + 1) for i in range(m + 1)]

	"""Following steps build L[m + 1][n + 1] in bottom up fashion
	Note: L[i][j] contains length of LCS of X[0..i-1]
	and Y[0..j-1]"""
	for i in range(m + 1):
		for j in range(n + 1):
			if i == 0 or j == 0 :
				L[i][j] = 0
			elif X[i-1] == Y[j-1]:
				L[i][j] = L[i-1][j-1]+1
			else:
				L[i][j] = max(L[i-1][j], L[i][j-1])

	# L[m][n] contains the length of LCS of X[0..n-1] & Y[0..m-1]
	return L[m][n]

@app.route('/', methods = ['GET', 'POST'])
@cross_origin()
def run():
	return 'online'

@app.route('/setimg', methods=['POST'])
def set_image():
	s = json.loads(request.data)['base64']
	s = s[s.index(',')+1:]
	with open ('../data/Sample2.jpg', 'wb') as fh:
		fh.write(base64.b64decode(s))
	return 'OK'


@app.route('/ocr')
@cross_origin()
def ocr():
	docText = returnOCR()
	cpy=docText
	if '\n' in docText:
		docText = docText[docText.index('\n')+1:]
	docText = docText.replace(' ', '\n')
	docArr = docText.split('\n')
	newDocArr = []
	for _ in docArr:
		if len(_) > 4:
			newDocArr.append(_)
	docArr = cpy.split('\n')
	foundMedsArr = []

	

	ma = 0
	ans = ''

	for word in newDocArr:
		w = word.upper()
		ma = 0
		ans = ''
		for med in list(set(get_close_matches(w, medArr))):
			cs = lcs(w, med)
			if cs > ma:
				ma = cs
				ans = med
		if ma != 0:
			foundMedsArr.append(ans)
		
	return jsonify(docArr, foundMedsArr)

if __name__ == '__main__':
	app.run(debug = True)


	