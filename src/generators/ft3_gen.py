import random
import os

import xml.dom.minidom
Element = xml.dom.minidom.Element
Text = xml.dom.minidom.Text

def runBatch():
    i = 1
    filelist = []       #Keeps tracks of files written so far

    #Since the top half of xml files for a specific fluency app are identical, just copy that for use laer
    header = getHeader("jungle_header.xml")
    
    #Generate the data
    while(i <= 40):
        dataset = generateDataSet()
        towrite = toXMLLegacy(dataset).toprettyxml()
        
        #Prepare to write to the XML file
        filelist.append("jungle_mono_equivalent" + str(i).zfill(3) + ".xml")
        f = open("private/jungle_mono_equivalent/jungle_mono_equivalent_" + str(i).zfill(3) + ".xml", 'w')
        
        #Actually write to the XML file
        if(f):
            for line in header:
                f.write(line)       #Header
            f.write(towrite)        #Body (what we generated)
            f.write("</GAME_DATA>\n")
            f.write("</INPUT>")     #Closes first tag that envelopes the entire XML
            f.close()
        
        i += 1

    #Generates a single dataset
def generateDataSet():
    i = 0
    list = []
    
    while(i < 4):
        temp = generate()
        
        if(temp != None):
            list.append(temp)
            i += 1
    
    return list

def generate():
    r = random.randint(2, 6)
    sub = 'Equal to ' + str(r) + 'x'
    set = []
    
    i = 0
    while(i < 10):
        ol = str(random.randint(0, 1))
        ans = str(random.randint(0, 1))
    
        if(ol == ans):
            s = getMonoValid(r)
        else:
            s = getMonoInvalid(r)
    
        set.append((ol, s, ans))
    
        i += 1
        
    return (sub, set)
    
def getMonoValid(coeff):
    r = random.randint(0, 4)
    
    if(r == 0):
        val = random.randint(1, coeff-1)
        return str(coeff-val).replace('1', '') + 'x + ' + str(val).replace('1', '') + 'x'
    elif(r == 1):
        val = random.randint(1, 4)
        return str(coeff+val).replace('1', '') + 'x - ' + str(val).replace('1', '') + 'x'
    elif(r == 2):
        val = random.randint(1, coeff-1)
        return 'x(' + str(coeff-val) + ' + ' + str(val) + ')'
    elif(r == 3):
        val = random.randint(1, 4)
        return 'x(' + str(coeff+val) + ' - ' + str(val) + ')'
    elif(r == 4):
        val = random.randint(2, 4)
        return str(val*coeff) + 'x / ' + str(val)
    
def getMonoInvalid(coeff):
    r = random.randint(0, 4)
    
    if(r == 0):
        val = random.randint(1, coeff-1)
        return str(coeff + val).replace('1', '') + 'x - ' + str(val)
    elif(r == 1):
        val = random.randint(1, coeff-1)
        return str(coeff - val).replace('1', '') + 'x + ' + str(val)
    elif(r == 2):
        val = random.randint(1, coeff-1)
        return str(coeff + val) + '(x - ' + str(val) + ')'
    elif(r == 3):
        val = random.randint(1, coeff-1)
        return str(coeff - val) + '(x + ' + str(val) + ')'
    elif(r == 4):
        val = random.randint(2, 4)
        return str(val*(coeff+1)) + 'x / ' + str(val)
    
def getBiValid(coeff, c):
    s = '(' + str(coeff*2) + ' + ' + str(c*2) + ') / 2'
    
    s = getMonoValid(coeff) + ' + ' + str(c)
    
    s = getMonoValid(coeff) + ' + ' + str(c-1) + ' + 1'

def getBiInvalid(coeff, c):
    pass
    
#Hurix Legacy Format - Converts internal dataset representation to XML
def toXMLLegacy(dataset):
    allQuestions = Element("PROBLEM_SET")
    
    sNum = 1
    for subset in dataset:
        allQuestions.appendChild(XMLSubsetLegacy(subset, sNum))
        sNum += 1
        
    return allQuestions

#Hurix Legacy Format - Converts a question subset into its XML equivalent
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

#Hurix Legacy Format - Converts a single question into its XML equivalent
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

#Outputs the dataset.xml file which functions as an index for the GameController in the output directory
def create_datasetxml(directory, filelist, engine):
    datasetxml = build_datasetxml(directory, filelist, engine)
    towrite = datasetxml.toprettyxml()
    f = open(directory + "dataset.xml", 'w')
    if(f):
        logfile.write("Writing datasets.xml\n")
        f.write(towrite)
        f.close()
    else:
        logfile.write("Error writing dataset.xml\n")

#Builds the XML index for the datasets that were already created and outputted
def build_datasetxml(directory, filelist, engine):
    root = Element('dataset')
    root.setAttribute('id', directory[0:-1])
    root.setAttribute('gameid', engine)
    
    for file in filelist:
        node = Element('datafile')
        node.setAttribute('id', file[0:-4])
        node.setAttribute('name', file)
        root.appendChild(node)
        
    return root

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
        logfile.write("Error opening xml header file\n")
        return [""]

runBatch()