def getFile(filename):
    file = []
    f = open(filename)
    if(f):
        for line in f:
            file.append(line)
        f.close()
        return file

j = 3
while(j < 7):
    j+= 1
    i = 0
    while(i < 40):
        i += 1
        
        file = getFile('test' + str(j) + '/set' + str(i).zfill(3) + ".xml")
        
        file[3] = file[3].replace('46000', '27000');
        file[4] = file[4].replace('62000', '43000');
        file[5] = file[5].replace('90000', '72000');
        
        file[10] = file[10].replace('2000', '1000');
        
        f = open('test' + str(j) + '/set' + str(i).zfill(3) + ".xml", 'w')
        
        for line in file:
            f.write(line)