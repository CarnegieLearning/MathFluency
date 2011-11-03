def getFile(filename):
    file = []
    f = open(filename)
    if(f):
        for line in f:
            file.append(line)
        f.close()
        return file

j = 0
while(j < 5):
    j+= 1
    i = 0
    while(i < 40):
        i += 1
        
        file = getFile('level04stage' + str(j) + '/l04_s' + str(j) + '_set' + str(i).zfill(3) + '.xml')
        
        output = []
        
        file[3] = file[3].replace('45000', '52000')
        file[4] = file[4].replace('69000', '79000')
        file[5] = file[5].replace('89000', '102000')

        f = open('level04stage' + str(j) + '/l04_s' + str(j) + '_set' + str(i).zfill(3) + '.xml', 'w')
        
        for line in file:
            f.write(line)