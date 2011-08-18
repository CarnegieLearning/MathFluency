import core
import random
import decimal
import math

#Shortcut abbreviations
RI = random.randint
RC = random.choice
D = decimal.Decimal

#Globals
LOAD_PREVIOUS_CONFIG = 0
SAVE_CURRENT_CONFIG = 0
GENERATE = 0
BATCHRUN = 1

#generator specific configuration settings
#EXPECTS: engine string, header file location, output directory, output filename
#NEEDS TO: pass expectations to core.config's __init__
#IMPORTANT: core.config expects a function "def generate(self):" to be defined
class decimalConfig1(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
    
        self.whole_min = 1      #smallest value right of the decimal
        self.whole_max = 10     #largest value right of the decimal
        self.part_min = 2      #smallest value left of the decimal
        self.part_max = 999     #largest value left of the decimal
        self.part_mag = 3       #divides [part_min, part_max] by power(10, part_mag)
    
        self.delititer_multiplier = 100 #multiply delimiters by this amount when coverting to string
        self.delimiter_prepend = ""     #Add this before the delimiter string (eg $)
        self.delimiter_append = "%"     #Add this after the delimiter string (eg %)
        
        self.selector_multiplier = 1    #As above, but for the selector
        self.selector_prepend = ""
        self.selector_append = ""
        
        self.r_min = 30         #min distance between selector and gate
        self.r_max = 300        #max distance between selector and gate
        self.r_mult = 0.01      #multiply distance by this amount before applying
        
        self.min_dist = D(1.33)#Minimum distance apart two adjecent selectors need to be
        self.last_val = None
        
    #Formats delimiters into strings
    def strDelim(self, d):
        dStr = D(d) * D(self.delititer_multiplier)
        if(dStr > 150):
            return self.delimiter_prepend + str(D(round(dStr, -1)).quantize(D(1))) + self.delimiter_append

        dStr = dStr.quantize(D(1))
        return self.delimiter_prepend + str(dStr) + self.delimiter_append
    
    #Formats selectors into strings    
    def strSelector(self, s):
        return self.selector_prepend + str(s * self.selector_multiplier) + self.selector_append
        
    #generates a question subset
    def generate(self):
        #Build a ranadom gate pattern that prevents staying in one lane (i.e. 222)
        #Note that a series of these patterns still have degenerate cases (ie 122 221 112 221 )
        pattern = [RC([0, 1]), RC([1, 2]), RC([0, 2])]

        whole = RI(self.whole_min, self.whole_max)
        
        part = 0
        part_string = ""
        #build the decimal, with a 5% chance of ignoring in favor of a whole number
        if(self.part_max > 0 and not (whole == 0 and self.whole_max > 0 and RI(0, 19) == 19)):
            part = D(RI(self.part_min, self.part_max))
            part = part / D(math.pow(10, self.part_mag))
            part_string = str(part)
                
            if(part > 100 and RI(0,4) == 4):
                part = part % 100
                if(part < 10):
                    part
                part_string = str(part)
                
            if(len(part_string) == 5 and part_string[3] != 0 and RI(0, 2) == 2):
                part = part.quantize(D("1.00"))
                part_string = str(part)
                
            if(len(part_string) == 4 and part_string[3] != 0 and RI(0, 1) == 1):
                part = part.quantize(D("1.0"))
                part_string = str(part)
            
        selector = D(whole + part)
        
        #retry if we are not at least a minimum distance away from the previous number
        if(self.last_val != None and abs(selector - D(self.last_val)) < self.min_dist):
            return None
        
        gates = []
        
        if(self.whole_max == 0):
            #Three decimal case edge cases
            if(len(part_string) == 5 and part_string[2] != '0'):
                #Three shift -> percent edge case (eg 0.357 -> 357%)
                if(RI(0, 1) == 1):
                    l = int(part_string[2])
                    r = l + RI(1, 5)
                    gates.append( ('0', self.strDelim(l), self.strDelim(r)) )
                #One shift -> percent edge case (eg 0.357 -> 3.57%)
                else:
                    l = RI(0, int(part_string[2])) / 100.0
                    r = (int(part_string[2]) + 1) / 100.0
                    gates.append( ('2', self.strDelim(l), self.strDelim(r)) )
            #Small decimal case edge case (<0.1) (eg 0.09 -> 9%)
            elif(len(part_string) > 3 and part_string[2] == '0'):
                l = ((int(part_string[3]) - 1) * 0.1) + RI(0, 7) * 0.01
                l = max(l, 0)
                r = (1 + (int(part_string[0])+RI(1, 9)) * 0.1)
                gates.append( ('0', self.strDelim(l), self.strDelim(r)) )
                
                pattern[2] = 0
        
        #single interger -> percent edge case (eg 5 -> 5%)
        if(part == 0):
            l = (whole - RI(1,5)) / 100.0
            l = max(l, 0)
            r = (whole + RI(1,5)) / 100.0
            gates.append( ('2', self.strDelim(l), self.strDelim(r)) )
            pattern[2] = RI(0,1)
        
        #finish remaining gates after edge cases
        while(len(gates) < len(pattern)):
            l = 0
            r = 0
            
            #case smaller
            if(pattern[len(gates)] == 0):
                l = selector + D(RI(self.r_min, self.r_max) * self.r_mult)
                r = l        + D(RI(self.r_min, self.r_max) * self.r_mult)
                
            #case between
            elif(pattern[len(gates)] == 1):
                l = selector - D(RI(self.r_min, self.r_max) * self.r_mult)
                r = selector + D(RI(self.r_min, self.r_max) * self.r_mult)
            
            #case larger
            elif(pattern[len(gates)] == 2):
                r = selector - D(RI(self.r_min, self.r_max) * self.r_mult)
                if(r < 0):
                    r = selector / D(2.0)
                l = r        - D(RI(self.r_min, self.r_max) * self.r_mult)
            
            #keep gates legal
            l = max(l, 0)
            r = max(r, 0)
            
            #without negatives, any right gate of 0 is a bad set
            if(r == 0):
                return None
            
            gates.append( (str(pattern[len(gates)]), self.strDelim(l), self.strDelim(r)) )
        
        #randomize the order of the gates (so edge cases do not always come first
        random.shuffle(gates)
        self.last_val = selector
        
        return (self.strSelector(selector), gates)

def loadBatch(loadWith, batchLoad):
    for configLocs in batchLoad:
        c = []
        for path in configLocs:
            c.append(loadWith.loadConfig(path))
        core.runBatch(c)
###############################################################################

#generate/build/load needed configs here
#IMPORTANT: Only the FIRST config is used by core.runBatch to set filenames, paths, engine, number of subsets and runs
#IMPORTANT: All configs are selected at random to run their own specified generate function for data generation
configs = [decimalConfig1('ft1_racecar', 'f1header.xml', 'private/test3/', 'set')]
configs[0].datasets_per_run = 40
    
#Load config(s)
if(LOAD_PREVIOUS_CONFIG):
    temp = configs[0].loadConfig(configs[0].directory + "generator_config")
    if(temp != None):
        configs[0] = temp
        
#Generate questions
if(GENERATE):
    core.runBatch(configs)
elif(BATCHRUN):
    batch = [['private/test1/generator_config'], ['private/test2/generator_config'],
             ['private/test3/generator_config1', 'private/test3/generator_config2']]
             
    loadBatch(decimalConfig1, batch)
                
#Save config(s)
if(SAVE_CURRENT_CONFIG):
    configs[0].saveConfig(configs[0].directory + "generator_config2")