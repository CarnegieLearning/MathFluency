import random
import xml.dom.minidom
import pickle

#Shortcut abbreviations
Element = xml.dom.minidom.Element

#Globals
xml_question_num = 0

#base configuration settings for the generator
class config:
    def __init__(self, eng, header, dir, name):
        self.subsets_per_set = 6
        self.datasets_per_run = 20
        
        self.engine = eng           #Name of the game engine
        self.xml_header = header    #Where to find the engine header
        self.directory = dir        #Directory for the datasets
        self.filename = name        #File name for datasets, will be appended with 001, 002, etc
    
    #Saves the current config to the specified file
    def saveConfig(self, filename):
        f = open(filename, 'w')
        if(f):
            pickle.dump(self, f)
            f.close()
        else:
            print("Error saving config to file")
    
    #Returns a loaded config from file; None if it fails to load
    def loadConfig(self, filename):
        f = open(filename, 'r')
        if(f):
            ret = pickle.Unpickler(f).load()
            f.close()
            return ret
        else:
            print("Error loading config from file")
            return None

def runBatch(configList, generate_func):
    i = 1
    c = configList[0]   #The first config in list is the primary config
    filelist = []

    #Since the top half of xml files for a specific fluency app are identical
    #just copy that for use laer
    header = getHeader(c.xml_header)
    
    while(i <= c.datasets_per_run):
        dataset = generateDataSet(configList, generate_func)
        xml = toXML(dataset)
        towrite = xml.toprettyxml()
        
        filelist.append(c.filename + str(i).zfill(3) + ".xml")
        f = open(c.directory + c.filename + str(i).zfill(3) + ".xml", 'w')
        
        for line in header:
            f.write(line)
        f.write(towrite)
        f.write("</INPUT>")
        f.close()
        
        i += 1
        
    create_datasetxml(c.directory, filelist, c.engine)

#Generates a single dataset
def generateDataSet(configList, generate_func):
    i = 0
    c = configList[0]   #The first config in list is the primary config
    list = []
    
    while(i < c.subsets_per_set):
        c = random.choice(configList)
        
        temp = generate_func(c)
        print(temp)
        
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
        print("Error writing dataset.xml")
    
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
        print("Error opening xml header file")