import random
import xml.dom.minidom
import pickle
import os

#Shortcut abbreviations
Element = xml.dom.minidom.Element

#Globals
TRUE = 1
FALSE = 0

xml_question_num = 0    #This is the needed due to laziness

###############################################################################

#Setup logging
try:
    logfile = open("last_run.log", 'w')
    if(not logfile):
        raise Exception()
except:
    import sys
    sys.stdout.write("Error opening logfile to write.  Dumping log into stdout")
    logfile = sys.stdout

###############################################################################

#Base <content> class
class content:
    #Default constructor
    def __init__(self, type = "Undefined"):
        self.type = type
    
    #Hack to make sure __str__ is called even when not using str() or print
    def __repr__(self):
        return self.__str__()
    
    #Subclassed must define a toXML function
    def toXML(self, node):
        raise NotImplementedError()

#Fraction <content>
class frtContent(content):
    def __init__(self, num, den, whole = None):
        content.__init__(self, "Fraction")
        
        self.n = num
        self.d = den
        self.w = whole
    
    #toString()
    def __str__(self):
        s = ""
        if(self.w != None):
            s += self.w + ' '
            
        s += str(self.n) + ' / ' + str(self.d)
        
        return s
    
    #Hooks the content into the specified node
    def toXML(self, node):
        node.setAttribute("TYPE", "Fraction")
        
        settings = Element("ContentSettings")
        settings.setAttribute("numerator", str(self.n))
        settings.setAttribute("denominator", str(self.d))
        
        #Only add <Whole> if there is a value to display (as zero will be displayed)
        if(self.w != None):
            settings.setAttribute("whole", str(self.w))
    
        node.appendChild(settings)
        
        return node
        
#String <content>
class strContent(content):
    def __init__(self, s):
        content.__init__(self, "String")
        
        self.s = str(s)
    
    #toString()
    def __str__(self):
        return self.s
    
    #Hooks the content into the specified node
    def toXML(self, node):
        node.setAttribute("TYPE", "String")
        
        settings = Element("ContentSettings")
        settings.setAttribute("string", self.s)
        
        node.appendChild(settings)
        
        return node

###############################################################################

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
    
    #Subclasses must implement their own generate method
    def generate(self):
        raise NotImplementedError()
        
    #Subclasses must provide a XML level generation function
    def toXML(self):
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

###############################################################################

#Load and run each set of configs in order
#INPUT: loadWith should be an instance of your generator specific configuration
#INPUT: batchLoad should be a list of lists e.g. [[config1], [config2], [config3a, config3b], ...]
def runMultiBatch(loadWith, batchLoad):
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
        if(not os.path.exists(c.directory)):
            os.mkdir(c.directory)
    except(OSError):
        logfile.write("Error creating directory or directory already exsists\n")
    
    #Set a static random if the config specifies one
    if(c.randomSeed != None):
        random.seed(c.randomSeed)
    
    #Generate the data
    while(i <= c.datasets_per_run):
        dataset = generateDataSet(configList)
        if(dataset == None):
            logfile.write("Dataset failed generation, aborting runBatch\n")
            return None
        
        #Convert to XML
        xml = c.toXML(dataset)
        towrite = xml.toprettyxml()
        
        #Prepare to write to the XML file
        if(c.outputXML):
            filelist.append(c.filename + str(i).zfill(3) + ".xml")
            f = open(c.directory + c.filename + str(i).zfill(3) + ".xml", 'w')
            
            #Actually write to the XML file
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
    
    #Only bother with dataset.xml if we are ouputting XML
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
    
    logfile.write("\n")
    
    while(i < c.subsets_per_set):
        config = random.choice(configList)
        
        #Generate the data
        try:
            temp = config.generate()
        except NotImplementedError:
            logfile.write("Error: config class did not implement method generate()")
            return None
            
        logfile.write(str(temp) + "\n")
        
        if(temp != None):
            list.append(temp)
            #list = temp
            i += 1
            none_counter = 0
        else:
            none_counter += 1
        
        #Guard against bad configs that fail to generate data
        if(none_counter >= 100):
            logfile.write("Detected " + str(none_counter) + " consecutive generate()s returning 'None', possibly bad config, aborting...\n")
            return None
    
    return list

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
    root.setAttribute('game_id', engine)
    
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