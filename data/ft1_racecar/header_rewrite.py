def getFile(filename):
    file = []
    f = open(filename)
    if(f):
        for line in f:
            file.append(line)
        f.close()
        return file

j = 0
while(j < 3):
    j+= 1
    i = 0
    while(i < 40):
        i += 1
        
        file = getFile('test' + str(j) + 'b/set' + str(i).zfill(3) + ".xml")
        
        #file[7] = '<SpeedSettings>\n'
        file[8] = '\t<Max VALUE="150"/>\n'
        file[9] = '\t<Min VALUE="0"/>\n'
        file[10] = '\t<Default VALUE="18"/>\n'
        #file[11] = '</SpeedSettings>\n'
        
        #file = file[:12] + file[88:]
        
        f = open('test' + str(j) + 'b/set' + str(i).zfill(3) + ".xml", 'w')
        
        for line in file:
            f.write(line)