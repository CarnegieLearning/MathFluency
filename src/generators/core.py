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

try:
    logfile = open("last_run.log", 'w')
    if(not logfile):
        raise Exception()
except:
    import sys
    sys.stdout.write("Error opening logfile to write.  Dumping log into stdout")
    logfile = sys.stdout

#base configuration settings for the generator
class config:
    def __init__(self, eng, header, dir, name):
        self.subsets_per_set = 6
        self.datasets_per_run = 20
        
        self.engine = eng           #Name of the game engine
        self.xml_header = header    #Where to find the engine header
        self.directory = dir        #Directory for the datasets
        self.filename = name        #File name for datasets, will be appended with 001, 002, etc
        
        self.outputXML = TRUE       #If TRUE, will output the .xml file for each dataset
        self.outputCSV = TRUE       #If TRUE, will output the .csv file for each dataset
        
        self.randomSeed = None      #Set to something other than None to use that as the random.seed()
    
    #Saves the current config to the specified file
    def saveConfig(self, filename):
        f = open(filename, 'w')
        if(f):
            pickle.dump(self, f)
            f.close()
            logfile.write("Saved config to " + str(filename) + "\n")
        else:
            logfile.write("Error saving config to " + str(filename) + "\n")
    
    def generate(self):
        raise NotImplementedError()
    
    #Returns a loaded config from file; None if it fails to load
    @staticmethod
    def loadConfig(filename):
        try:
            f = open(filename, 'r')
            if(f):
                ret = pickle.Unpickler(f).load()
                f.close()
                logfile.write("Loaded config from " + str(filename) + "\n")
                return ret
            else:
                logfile.write("No config file found at " + str(filename) + "\n")
                return None
        except IOError:
            logfile.write("IOError attempting to open config file at " + str(filename) + "\n")
            return None
        
def loadBatch(loadWith, batchLoad):
    for configLocs in batchLoad:
        c = []
        for path in configLocs:
            c.append(loadWith.loadConfig(path))
        runBatch(c)
            
#Generates a number of datasets and outputs them to files
def runBatch(configList):
    i = 1
    c = configList[0]   #The first config in list is the primary config
    filelist = []       #Keeps tracks of files written so far
    
    logfile.write("\n--------------------  Starting runBatch()  --------------------\n\n")

    #Since the top half of xml files for a specific fluency app are identical, just copy that for use laer
    header = getHeader(c.xml_header)
        
    #Make sure we have a directory to work with
    try:
        os.mkdir(c.directory)
    except(OSError):
        logfile.write("Error creating directory or directory already exsists\n")
    
    #Set a static random if the config specifies one
    if(c.randomSeed != None):
        random.seed(c.randomSeed)
    
    while(i <= c.datasets_per_run):
        #Generate the data
        dataset = generateDataSet(configList)
        if(dataset == None):
            logfile.write("Dataset failed generation, aborting runBatch\n")
            return None
        
        #Convert to XML
        xml = toXML(dataset)
        towrite = xml.toprettyxml()
        
        #Write to XML file
        if(c.outputXML):
            filelist.append(c.filename + str(i).zfill(3) + ".xml")
            f = open(c.directory + c.filename + str(i).zfill(3) + ".xml", 'w')
            
            if(f):
                logfile.write("Writing to file " + str(filelist[len(filelist)-1]) + "\n")
                
                for line in header:
                    f.write(line)       #Header
                f.write(towrite)        #Body (what we generated)
                f.write("</INPUT>")     #Closes first tag that envelopes the entire XML
                f.close()
                
            else:
                logfile.write("Error attempting to write to file " + str(filelist[-1]) + "\n")
        else:
            logfile.write("outputXML set to " + str(c.outputXML) + ".  Skipping file write.\n")

        #Convert and write to CSV
        if(c.outputCSV):
            dumpCSV(c.directory + c.filename + str(i).zfill(3) + ".csv", dataset)
        else:
            logfile.write("outputCSV set to " + str(c.outputCSV) + ".  Skipping file write.\n")
        
        i += 1
    
    if(c.outputXML):
        create_datasetxml(c.directory, filelist, c.engine)
    else:
        logfile.write("outputXML set to " + str(c.outputXML) + ".  Skipping dataset.xml write.\n")
        
    logfile.write("\n--------------------  Ending runBatch()  --------------------\n\n")

#Generates a single dataset
def generateDataSet(configList):
    i = 0
    c = configList[0]   #Use the first config in list is the primary config
    list = []
    none_counter = 0
    
    while(i < c.subsets_per_set):
        c = random.choice(configList)
        
        #Generate the data
        try:
            temp = c.generate()
        except NotImplementedError:
            logfile.write("Error: config class did not implement method generate()")
            return None
            
        logfile.write(str(temp) + "\n")
        
        if(temp != None):
            list.append(temp)
            i += 1
            none_counter = 0
        else:
            none_counter += 1
        
        #Guard against bad configs that fail to generate data
        if(none_counter >= 20):
            logfile.write("Detected " + str(none_counter) + " consecutive generate()s returning 'None', possibly bad config, aborting...\n")
            return None
    
    return list

#Converts internal dataset representation to XML
#IMPUT: dataset should be a list of subsets
def toXML(dataset):
    global xml_question_num
    xml_question_num = 1
    
    allQuestions = Element("PROBLEM_SET")
    
    for subset in dataset:
        allQuestions.appendChild(XMLSubset(subset))
        
    return allQuestions

#Converts a question subset into its XML equivalent
#INPUT: subset should be [selector, (answer, delim1, delim2, ...), (answer, delim1, delim2, ...), ...]
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

#Converts a single question into its XML equivalent
#INPUT: q should be (answer, delim1, delim2, ...)
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

#Outputs the dataset.xml file which functions as an index for the GameController in the output directory
def create_datasetxml(directory, filelist, engine):
    datasetxml = build_datasetxml(directory, filelist, engine)
    towrite = datasetxml.toprettyxml()
    f = open(directory + "dataset.xml", 'w')
    if(f):
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

#Converts the internal dataset format to CSV and outputs it to a file alongside the XML
def dumpCSV(filename, dataset):
    i = 1
    j = 1
    f = open(filename, 'w')
    if(f):
        logfile.write("Writing to file " + str(filename) + "\n")
        f.write("Subset #,Q#,Selector,,,Lower Gate,,Upper Gate,,,\n")
        for subset in dataset:
            s = str(j) + ','
            for question in subset[1]:
                #Initial column buffering for non start of subset rows
                if(s == ""):
                    s = ','
                #Question numbering
                s += str(i) + ','
                
                #Selector placement for start of subset rows
                #The extra single quote is to tell Excel to not try and interpet the cell
                if(s[0] != ','):
                    s += '\'' + str(subset[0])
                s+= ',,'
                
                #Edge case that the answer is in the first column
                if(question[0] == '0'):
                    s += 'x'
                
                #Adds the correct answer marker to the specified lane
                #The extra single quote is to tell Excel to not try and interpet the cell
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