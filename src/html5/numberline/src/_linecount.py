import os

dirname = os.getcwd()
filelist =[f for f in os.listdir(dirname)
     if os.path.isfile(os.path.join(dirname, f))]

line = 0

for file in filelist:
    f = open(file, 'r')
    line -= 16
    while(f.readline()):
        line += 1

print str(line)