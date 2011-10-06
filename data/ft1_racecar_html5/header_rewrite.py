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
        
        file = getFile('test' + str(j) + 'b/set' + str(i).zfill(3) + ".xml")
        
        output = []
        
        for line in file:
            if line.find('TARGET') != -1:
                out =  '        <TARGET TYPE="String">\n'
                out += '            <ContentSettings>\n'
                out += '                <String VALUE="1"/>\n'
                out += '            </ContentSettings>\n'
                out += '        </TARGET>\n'
                output.append(out)
            
            elif line.find('over') != -1:
                whole = 0
                step1 = line.partition('over')
                
                if(line.find('and') == -1):
                    numerator = step1[0].partition('images/')[2]
                else:
                    step2 = step1[0].partition('and')
                    numerator = step2[2]
                    whole = step2[0].partition('images/')[2]
                    
                denominator = step1[2].partition('-42x')[0]
                
                out =  '            <Content TYPE="Fraction">\n'
                out += '                <ContentSettings>\n'
                if(whole > 0):
                    out += '                    <Whole VALUE="' + whole + '"/>\n'
                out += '                    <Numerator VALUE="' + numerator + '"/>\n'
                out += '                    <Denominator VALUE="' + denominator + '"/>\n'
                out += '                </ContentSettings>\n'
                out += '            </Content>\n'
                
                output.append(out)
            
            elif line.find('42x42') != -1:
                whole = line.partition('-42x42')[0].partition('images/')[2]
                
                out =  '            <Content TYPE="String">\n'
                out += '                <ContentSettings>\n'
                out += '                    <String VALUE="' + whole + '"/>\n'
                out += '                </ContentSettings>\n'
                out += '            </Content>\n'
                
                output.append(out)
            
            elif line.find('DELIMETER') == -1:
                output.append(line)
        f = open('test' + str(j) + 'b/set' + str(i).zfill(3) + ".xml", 'w')
        
        for line in output:
            f.write(line)