import xml.dom.minidom
import os

#Run this for each engine's data directory to build the xml containing the engine's valid datasets

Element = xml.dom.minidom.Element

directory = "..\\ft1_racecar\\"

root = Element("datasets")
root.setAttribute("game_id", "ft1_racecar")

list = os.listdir(directory)
dirList = []

for obj in list:
    if(os.path.isdir(directory + obj) and obj != "Images"):
        dirList.append(obj)
        
print(str(dirList))

for dir in dirList:
    set = Element("dataset")
    set.setAttribute("", str(dir))
    root.appendChild(set)
    
towrite = root.toprettyxml()
f = open(directory + "datasets.xml", 'w')
if(f):
    f.write(towrite)
    f.close()
else:
    print("Error writing dataset.xml")