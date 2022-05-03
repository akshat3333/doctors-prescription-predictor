from difflib import get_close_matches
from meds import medArr
w='riboflavin'
w=w.upper()
for med in list(set(get_close_matches(w, medArr))):
    print(med)