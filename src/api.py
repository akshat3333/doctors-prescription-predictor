import doctest
import os, io
from google.cloud import vision_v1
from google.cloud.vision_v1 import types
import pandas as pd
from google.cloud import storage
from flask import Flask, jsonify, request
from flask import send_file
from flask_cors import CORS, cross_origin
import json, base64
import time
import pandas as pd    
from difflib import get_close_matches
from meds import medArr


os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = r'ServiceAccountToken.json'
# storage_client = storage.Client.from_service_account_json('ServiceAccountToken.json')
# storage_client = storage.Client()
client = vision_v1.ImageAnnotatorClient()

FOLDER_PATH = r''
IMAGE_FILE = '../data/Sample2.jpg'
FILE_PATH = os.path.join(FOLDER_PATH, IMAGE_FILE)

def returnOCR():
  with io.open(FILE_PATH, 'rb') as image_file:
    content = image_file.read()

  image = vision_v1.types.Image(content=content)
  response = client.document_text_detection(image=image)

  return response.full_text_annotation.text