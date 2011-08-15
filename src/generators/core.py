import random
import xml.dom.minidom
import pickle
import os

#Shortcut abbreviations
Element = xml.dom.minidom.Element

#Globals
TRUE = 1
FALSE = 0
xml_question_num = 0
logfile = open("last_run.log", 'w')

#base configuration settings for the generator
class config:
    def __init__(self, eng, header, dir, name):
        self.subsets_per_set = 6
        self.datasets_per_run = 20
        
        self.engine = eng           #Name of the game engine
        self.xml_header = header    #Where to find the engine header
        self.directory = dir        #Directory for the datasets
        self.filename = name        #File name for datasets, will be appended with 001, 002, etc
        
        self.outputCSV = FALSE      #If TRUE, will output the .csv file for each dataset
    
    #Saves the current config to the specified file
    def saveConfig(self, filename):
        f = open(filename, 'w')
        if(f):
            pickle.dump(self, f)
            f.close()
        else:
            logfile.write("Error saving config to file\n")
    
    #Returns a loaded config from file; None if it fails to load
    @staticmethod
    def loadConfig(filename):
        f = open(filename, 'r')
        if(f):
            ret = pickle.Unpickler(f).load()
            f.close()
            return ret
        else:
            logfile.write("Error loading config from file\n")
            return None

def runBatch(configList):
    i = 1
    c = configList[0]   #The first config in list is the primary config
    filelist = []

    #Since the top half of xml files for a specific fluency app are identical
    #just copy that for use laer
    header = getHeader(c.xml_header)
        
    try:
        os.mkdir(c.directory)
    except(OSError):
        logfile.write("Error creating directory or directory already exsists\n")
    
    while(i <= c.datasets_per_run):
        dataset = generateDataSet(configList)
        xml = toXML(dataset)
        towrite = xml.toprettyxml()
        
        filelist.append(c.filename + str(i).zfill(3) + ".xml")
        f = open(c.directory + c.filename + str(i).zfill(3) + ".xml", 'w')
        
        for line in header:
            f.write(line)
        f.write(towrite)
        f.write("</INPUT>")
        f.close()
        
        if(c.outputCSV):
            dumpCSV(c.directory + c.filename + str(i).zfill(3) + ".csv", dataset)
        
        i += 1
        
    create_datasetxml(c.directory, filelist, c.engine)

#Generates a single dataset
def generateDataSet(configList):
    i = 0
    c = configList[0]   #Use the  first config in list is the primary config
    list = []
    
    while(i < c.subsets_per_set):
        c = random.choice(configList)
        
        temp = c.generate()
        logfile.write(str(temp) + "\n")
        
        if(temp != None):
            prev = temp[0]
            list.append(temp)
            i += 1
    
    return list
            
def toXML(dataset):
    global xml_question_num
    xml_question_num = 1
    
    allQuestions = Element("PROBLEM_SET")
    
    for subset in dataset:
        allQuestions.appendChild(XMLSubset(subset))
        
    return allQuestions

def XMLSubset(subset):
    selector, questions = subset

    subset = Element("PROBLEM_SUBSET")
    target = Element("TARGET")
    target.setAttribute("TYPE", "text")
    target.setAttribute("VALUE", selector)
    subset.appendChild(target)
    
    for q in questions:
        subset.appendChild(XMLQuestion(q))
        
    return subset
    
def XMLQuestion(q):
    global xml_question_num
    question = Element("QUESTION")
    question.setAttribute("INDEX", str(xml_question_num))
    xml_question_num += 1
    
    delimiters = Element("DELIMETERS_TEXT")
    
    i = 1
    while(i < len(q)):
        e = Element("DELIMETER")
        e.setAttribute("VALUE", q[i])
        delimiters.appendChild(e)
        i += 1
    
    question.appendChild(delimiters)
    question.appendChild(Element("DELIMETERS_IMAGE"))
    
    e = Element("ANSWER")
    e.setAttribute("VALUE", q[0])
    question.appendChild(e)
    
    return question

def create_datasetxml(directory, filelist, engine):
    datasetxml = build_datasetxml(directory, filelist, engine)
    towrite = datasetxml.toprettyxml()
    f = open(directory + "dataset.xml", 'w')
    if(f):
        f.write(towrite)
        f.close()
    else:
        logfile.write("Error writing dataset.xml\n")
    
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

def dumpCSV(filename, dataset):
    i = 1
    j = 1
    f = open(filename, 'w')
    if(f):
        f.write("Subset #,Q#,Selector,,,Lower Gate,,Upper Gate,,,\n")
        for subset in dataset:
            s = str(j) + ','
            for question in subset[1]:
                if(s == ""):
                    s = ','
                s += str(i) + ','
                
                if(s[0] != ','):
                    s += str(subset[0])
                s+= ',,'
                
                if(question[0] == '0'):
                    s += 'x'
                    
                h = 1
                while(h < len(question)):
                    s += ',"\'' + question[h] + '",'
                    if(question[0] == str(h)):
                        s += 'x'
                    h += 1
                
                f.write(s + "\n")
                
                s = ""
                i += 1
            j += 1
    else:
        logfile.write("Error opening CSV file for write.\n")