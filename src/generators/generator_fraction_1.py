import core
import random
import fractions

#Shortcut abbreviations
RI = random.randint
RC = random.choice
F = fractions.Fraction

#Globals
LOAD_PREVIOUS_CONFIG = 1
SAVE_CURRENT_CONFIG = 1
GENERATE = 1
BATCHRUN = 0

#generator specific configuration settings
#EXPECTS: engine string, header file location, output directory, output filename
#NEEDS TO: pass expectations to core.config's __init__
#IMPORTANT: core.config expects a function "def generate(self):" to be defined
class fractionConfig1(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
        
        self.num_min = [1, 1, 1, 1, 1, 1, 1]      #smallest value of numerator
        self.num_max = [8, 12, 16, 20, 25, 30, 35]     #largest value of numerator
        self.valid_denominators = [2, 3, 4, 5, 8, 10, 12]
        
        self.mixed = 3
        self.unreduced = 1
        self.force_same_denom = 0
        
    def buildStr(self, n, d, h, w, mix):
        s = "IMAGE:fluency/data/images/"
        
        if(n == 0):
            return "0"
        
        if(self.mixed):
            if(F(n, d) > 1 and mix == 0):
                if(n % d == 0):
                    return s + str(n / d) + "-" + str(h) + "x" + str(w)+ ".png"
                s += str(n / d) + "and"
                n = n % d
        
        if(self.unreduced):
            return s + str(n) + "over" + str(d) + "-" + str(h) + "x" + str(w)+ ".png"
        else:
            div = fractions.gcd(n, d);
            return s + str(n/div) + "over" + str(d/div) + "-" + str(h) + "x" + str(w)+ ".png"
        
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
            c1 = RI(0, len(self.valid_denominators)-1)
            d1 = self.valid_denominators[c1]
            if(self.force_same_denom):
                d2 = d1
                c2 = c1
            else:
                c2 = RI(0, len(self.valid_denominators)-1)
                d2 = self.valid_denominators[c2]
            
            #case smaller
            if(pattern[len(gates)] == 0):
                n1 = RI(d1 + 1, self.num_max[c1])
                
                temp = i_hate_fractions(F(n1, d1), d2)
                
                n2 = RI(temp, max(self.num_max[c2], temp + 3))
                
            #case between
            elif(pattern[len(gates)] == 1):
                n1 = RI(1, min(d1 - 1, self.num_max[c1]))
                n2 = RI(d2 + 1, self.num_max[c2])
            
            #case larger
            elif(pattern[len(gates)] == 2):
                n2 = RI(self.num_min[c1], min(d2 - 1, self.num_max[c2]))
                
                temp = i_hate_fractions2(F(n2, d2), d1) - 1
                
                if(temp < self.num_min[c1] + 1):
                    n1 = temp
                else:
                    n1 = RI(self.num_min[c1], temp)
            
            
            mix1 = 0
            mix2 = 0                
            if(self.mixed and self.unreduced):
                mix1 = RI(0, 1)
                mix2 = RI(0, 1)
            
            if(not (n1 == 0 or n2 == 0 or (n1 == n2 and d1 == d2))):
                gates.append( (str(pattern[len(gates)]),
                    self.buildStr(n1, d1, 140, 140, mix1), self.buildStr(n2, d2, 140, 140, mix2),
                    self.buildStr(n1, d1, 42, 42, mix1), self.buildStr(n2, d2, 42, 42, mix2)) )
            
        #randomize the order of the gates
        random.shuffle(gates)
        
        return (str(selector), gates)

def i_hate_fractions(f, d2):
    i = 1
    while(f >= F(i, d2)):
        i += 1
    return i

def i_hate_fractions2(f, d2):
    i = 1
    while(f > F(i, d2)):
        i += 1
    return i
        
    
###############################################################################

#generate/build/load needed configs here
#IMPORTANT: Only the FIRST config is used by core.runBatch to set filenames, paths, engine, number of subsets and runs
#IMPORTANT: All configs are selected at random to run their own specified generate function for data generation
configs = [fractionConfig1('ft1_racecar', 'f1header.xml', 'private/test7/', 'set')]
configs[0].subsets_per_set = 1
configs[0].datasets_per_run = 40
configs[0].outputCSV = 0

#Load config(s)
if(LOAD_PREVIOUS_CONFIG):
    temp = configs[0].loadConfig(configs[0].directory + "generator_config")
    if(temp != None):
        configs[0] = temp

configs[0].num_max = [4, 8, 12, 16, 28, 36, 36]
        
#Generate questions
if(GENERATE):
    core.runBatch(configs)
elif(BATCHRUN):
    batch = [['private/test4/generator_config'], ['private/test5/generator_config'],
             ['private/test6/generator_config'], ['private/test7/generator_config']]
             
    core.runMultiBatch(fractionConfig1, batch)

#Save config(s)
if(SAVE_CURRENT_CONFIG):
    configs[0].saveConfig(configs[0].directory + "generator_config")