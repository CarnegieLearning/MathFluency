import core
import items
import random

###################################################################################################
#Hurix style FT3 generator
import os
import xml.dom.minidom
Element = xml.dom.minidom.Element
Text = xml.dom.minidom.Text

def runBatch(prefix, v):
    i = 1
    filelist = []       #Keeps tracks of files written so far
    
    mult = v[0:4]
    prefix += "_" + v[4]

    #Since the top half of xml files for a specific fluency app are identical, just copy that for use laer
    header = getHeader("scuba_header.xml")
    
    #Generate the data
    while(i <= 10):
        dataset = generateDataSet(mult)
        towrite = toXMLLegacy(dataset).toprettyxml()
        
        #Prepare to write to the XML file
        filelist.append(prefix + "_" + str(i).zfill(3) + ".xml")
        
        if(not os.path.exists("private/" + prefix)):
            os.mkdir("private/" + prefix)
        f = open("private/" + prefix + "/" + prefix + "_" + str(i).zfill(3) + ".xml", 'w')
        
        #Actually write to the XML file
        if(f):
            for line in header:
                f.write(line)       #Header
            f.write(towrite)        #Body (what we generated)
            f.write("</GAME_DATA>\n")
            f.write("</INPUT>")     #Closes first tag that envelopes the entire XML
            f.close()
        
        i += 1
        
        create_datasetxml(prefix + "/", filelist, "scuba");

    #Generates a single dataset
def generateDataSet(mult):
    i = 0
    list = []
    
    while(i < 4):
        temp = generate(mult[i])
        
        if(temp != None):
            list.append(temp)
            i += 1

    return list

# Generates a subset
def generate(m):
    sub = 'Multiple of ' + str(m) + 'x'
        
    set = []
    i = 0
    while(i < 10):
        ol = str(random.randint(0, 1))
        ans = str(random.randint(0, 1))
    
        if(ol == ans):
            s = valid(m)
        else:
            s = invalid(m)
    
        set.append((ol, s, ans))
    
        i += 1
        
    return (sub, set)
    
def valid(m):
    c = 0
    while(c == 0 or c == 1):
        c = random.randint(-9, 9)
    
    return str(c * m)
    
    
def invalid(m):
    c = 0
    while(c == 0 or c == 1 or c % m == 0):
        c = random.randint(-9 * m, 9 * m)
    
    return str(c)
    
    #FT3 Hurix Legacy Format - Converts internal dataset representation to XML
def toXMLLegacy(dataset):
    allQuestions = Element("PROBLEM_SET")
    
    sNum = 1
    for subset in dataset:
        allQuestions.appendChild(XMLSubsetLegacy(subset, sNum))
        sNum += 1
        
    return allQuestions

#FT3 Hurix Legacy Format - Converts a question subset into its XML equivalent
def XMLSubsetLegacy(subset, sNum):
    selector, questions = subset
    
    subset = Element("PROBLEM_SUBSET")
    subset.setAttribute("TIME_PER_QUESTION", str(4000 - 500 * sNum))
    
    target = Element("TARGET")
    target.setAttribute("ID", str(sNum))
    target.setAttribute("Type", "Text")
    target.setAttribute("Value", selector)
    t = Text()
    t.data = ''
    target.appendChild(t)
    subset.appendChild(target)
    
    qNum = 1
    for q in questions:
        subset.appendChild(XMLQuestionLegacy(q, qNum))
        qNum += 1
        
    return subset

#FT3 Hurix Legacy Format - Converts a single question into its XML equivalent
def XMLQuestionLegacy(q, qNum):
    question = Element("QUESTION")
    question.setAttribute("ID", str(qNum))
    question.setAttribute("PLATFORM", "true")
    question.setAttribute("ANSWER", q[2])
    
    e = Element("QUESTION")
    e.setAttribute("Lane", q[0])
    e.setAttribute("Type", "Text")
    e.setAttribute("Value", q[1])
    t = Text()
    t.data = ''
    e.appendChild(t)
    question.appendChild(e)
    
    return question
    
#Retrieves the reusable header for each dataset based on the engine involved
def getHeader(filename):
    header = []
    f = open(filename)
    if(f):
        for line in f:
            header.append(line)
        f.close()
        return header
    else:
        return [""]
        
#Outputs the dataset.xml file which functions as an index for the GameController in the output directory
def create_datasetxml(directory, filelist, engine):
    datasetxml = build_datasetxml(directory, filelist, "ft3_scuba")
    towrite = datasetxml.toprettyxml()
    f = open("private/" + directory + "dataset.xml", 'w')
    if(f):
        f.write(towrite)
        f.close()

#Builds the XML index for the datasets that were already created and outputted
def build_datasetxml(directory, filelist, engine):
    root = Element('dataset')
    root.setAttribute('id', directory[0:-1])
    root.setAttribute('game_id', engine)
    
    for file in filelist:
        node = Element('datafile')
        node.setAttribute('id', file[0:-4])
        node.setAttribute('name', file)
        root.appendChild(node)
        
    return root

###################################################################################################

variations = []
def rHelp(set, m):
    if(len(m) == 0):
        set.append(str(set[0]) + str(set[1]) + str(set[2]) + str(set[3]))
        variations.append(set)
        return

    i = 0
    while(i < len(m)):
        new = list(set)
        new.append(0)
        new[-1] = m[i]
        
        t = list(m)
        t.remove(m[i])
        rHelp(new, t)
        
        i+=1

rHelp([], [3, 6, 7, 8])

while(len(variations) > 0):
    runBatch("scuba", variations[0])
    variations.pop(0)

