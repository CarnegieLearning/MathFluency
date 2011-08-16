import core
import random
import fractions

#Shortcut abbreviations
RI = random.randint
RC = random.choice
F = fractions.Fraction

#Globals
LOAD_PREVIOUS_CONFIG = 0
SAVE_CURRENT_CONFIG = 1
GENERATE = 1

#generator specific configuration settings
#EXPECTS: engine string, header file location, output directory, output filename
#NEEDS TO: pass expectations to core.config's __init__
#IMPORTANT: core.config expects a function "def generate(self):" to be defined
class fractionConfig1(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
        
        self.num_min = 1      #smallest value of numerator
        self.num_max = 20     #largest value of numerator
        self.valid_denominators = [2, 3, 4, 5, 8, 10, 12]
        
        self.mixed = 3
        self.unreduced = 1
        self.force_same_denom = 0
        
    def buildStr(self, n, d):
        s = ""
        
        if(n == 0):
            return "0"
        
        if(self.mixed):
            if(F(n, d) > 1):
                s = str(n / d)
                n = n % d
                if(n == 0):
                    return s
                s += "  "
        
        if(self.unreduced):
            s += str(n) + " / " + str(d)
        else:
            s += str(F(n, d))
            
        return s
        
    #generates a question subset
    #EXPECTS: Nothing
    #RETURNS: (selector, [ (answer, gate1, gate2, ...), (answer, gate1, gate2, ...), ... ] )  All values should be strings
    #RETURNS: None, which causes the generator to try the subset again with a random config
    def generate(self):
        pattern = [RC([0, 1]), RC([1, 2]), RC([0, 2]), RC([0, 1]), RC([1, 2]), RC([0, 2]), 
                   RC([0, 1]), RC([1, 2]), RC([0, 2]), RC([0, 1]), RC([1, 2]), RC([0, 2]), 
                   RC([0, 1]), RC([1, 2]), RC([0, 2]), RC([0, 1]), RC([1, 2]), RC([0, 2])]
        gates = []
        
        selector = 1

        #finish remaining gates after edge cases
        while(len(gates) < len(pattern)):
            l = 0
            r = 0
            d1 = RC(self.valid_denominators)
            if(self.force_same_denom):
                d2 = d1
            else:
                d2 = RC(self.valid_denominators)
            
            #case smaller
            if(pattern[len(gates)] == 0):
                if(self.mixed):
                    n1 = RI(d1 + 1, d1 * self.mixed)
                else:
                    n1 = RI(d1 + 1, self.num_max)
                
                temp = i_hate_fractions(F(n1, d1), d2)
                
                if(self.mixed):
                    n2 = RI(temp, max(d2 * self.mixed, temp + d2))
                else:
                    n2 = RI(temp, max(self.num_max, temp + 3))
                
            #case between
            elif(pattern[len(gates)] == 1):
                n1 = RI(1, d1 - 1)
                
                if(self.mixed):
                    n2 = RI(d2 + 1, d2 * self.mixed)
                else:
                    n2 = RI(d2 + 1, self.num_max)
            
            #case larger
            elif(pattern[len(gates)] == 2):
                n2 = RI(self.num_min, d2 - 1)
                
                temp = i_hate_fractions(F(n2, d2), d1)
                
                if(temp - 1 < self.num_min + 1):
                    n1 = temp - 1
                else:
                    n1 = RI(self.num_min, temp - 1)
            
            if(not (n1 == n2 and d1 == d2)):
                gates.append( (str(pattern[len(gates)]), self.buildStr(n1, d1), self.buildStr(n2, d2)) )
            
        #randomize the order of the gates
        random.shuffle(gates)
        
        return (str(selector), gates)

def i_hate_fractions(f, d2):
    i = 1
    while(f >= F(i, d2)):
        i += 1
    return i
    
###############################################################################

batchLoad = ['private\\test4\\', 'private\\test5\\', 'private\\test6\\']

#generate/build/load needed configs here
#IMPORTANT: Only the FIRST config is used by core.runBatch to set filenames, paths, engine, number of subsets and runs
#IMPORTANT: All configs are selected at random to run their own specified generate function for data generation
configs = [fractionConfig1('ft1_racecar', 'f1header.xml', 'private\\test6\\', 'set')]
configs[0].subsets_per_set = 1
configs[0].datasets_per_run = 40

#for path in batchLoad:
#    c = core.config.loadConfig(path + "generator_config")
#    core.runBatch([c])
    
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