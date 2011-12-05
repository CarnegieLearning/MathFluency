import core
import items
import random
import fractions
import decimal
import operator
import level_output

#Shortcut abbreviations
RI = random.randint
RC = random.choice
F = fractions.Fraction
D = decimal.Decimal

#Globals
LOAD_PREVIOUS_CONFIG = 0
SAVE_CURRENT_CONFIG = 0
GENERATE = 1

#generator specific configuration settings
#EXPECTS: engine string, header file location, output directory, output filename
#NEEDS TO: pass expectations to core.config's __init__
#IMPORTANT: core.config expects a function "def generate(self):" to be defined
class configV2(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
        
        self.mixed = 0      #If true, selectors will include mixed numbers
        self.improper = 0   #If true, selectors will include improper fractions
        self.reduced = 0    #TODO: If true, selectors will be in reduced form (note: 7/6 is 'reduced' for an improper fraction)
        self.sameD = 1      #Keeps all denominators the same on a single questions
    
    #Formats the decimal gates to strings
    def format(self, s):
        st = str(s)
        if(len(st) > 5):
            st = st[:5]
            
        if(st[1:] == ".0"):
            st = st[0]
        return st
    
    #Formats the selector into a tuple of strings
    def formatSelector(self, s):
        if(self.mixed and s[0] > s[1]):
            if(not self.improper or RI(0,1)):
                return core.frtContent(str(s[0] - s[1]), str(s[1]), "1")
        return core.frtContent(str(s[0]), str(s[1]))
    
    #generates a question subset
    #EXPECTS: Nothing
    #RETURNS: (selector, [ (answer, gate1, gate2, ...), (answer, gate1, gate2, ...), ... ] )  All values should be strings
    #RETURNS: None, which causes the generator to try the subset again with a random config
    def generate(self):
        pattern = [RC([0, 1]), RC([1, 2]), RC([0, 2])]
        gates = []
        
        #Get the selector
        selector = self.getSelector()
        while(selector[0] == 0):
            selector = self.getSelector()
        
        #Establish the decimal step size
        step = 1.0 / selector[1]
        
        #Temporary equivalents
        num = selector[0]
        den = selector[1]
        
        fract = F(selector[0], selector[1]);

        #Loop through gates
        while(len(gates) < len(pattern)):
            attempt = 0
            d = None
            if(self.sameD == 1):
                d = den
            #Selector is smaller
            if(pattern[len(gates)] == 0):
                left = items.FI.getLarger(fract, d)
                if(left != None):
                    right = items.FI.getLarger(F(left[0], left[1]), d)
                
            #Selector is in between
            elif(pattern[len(gates)] == 1):
                left = items.FI.getSmaller(fract, d)
                if(left != None):
                    right = items.FI.getLarger(fract, d)
                
            #Selector is larger
            elif(pattern[len(gates)] == 2):
                right = items.FI.getSmaller(fract, d)
                if(right != None):
                    left = items.FI.getSmaller(F(right[0], right[1]), d)
                
            if(left == None or right == None):
                return None
            
            #Convert gates to strings
            left = self.formatSelector(left)
            right = self.formatSelector(right)
            
            #Append and continue
            gates.append((str(pattern[len(gates)]), left, right))
            
        #randomize the order of the gates
        random.shuffle(gates)
        
        return (core.strContent(self.format(selector[0] * 1.0 / selector[1])), gates)
    
    #Retrieves a selector based on the current settings
    def getSelector(self):
        selector = 0
        
        selector = items.FI.get()
        while(selector[0] == 0):
            selector = items.FI.get()
        #If we have to generate values greater than 1
        if(self.mixed or self.improper):
            #Coin flip to determine <1 or 1<
            if(RI(0,1)):
                selector = items.FI.makeImproper(1, selector)
        
        return selector

###############################################################################

level = "04"
stage = "1"

#generate/build/load needed configs here
configs = [configV2('ft1_racecar_html5', 'f1header_w3.xml', 'private/level'+level+'stage'+stage+'/', 'l'+level+'_s'+stage+'_set')]
configs[0].subsets_per_set = 6
configs[0].datasets_per_run = 40
configs[0].outputCSV = 0

configs[0].toXML = level_output.Racecar_toXML

#Load config(s)
if(LOAD_PREVIOUS_CONFIG):
    temp = configs[0].loadConfig(configs[0].directory + "generator_config")
    if(temp != None):
        configs[0] = temp

#Generate questions
if(GENERATE):
    core.runBatch(configs)

#Save config(s)
if(SAVE_CURRENT_CONFIG):
    configs[0].saveConfig(configs[0].directory + "generator_config")