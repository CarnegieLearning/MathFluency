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
class newConfig(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
        
        self.num_min = 1      #smallest value right of the decimal
        self.num_max = 13     #largest value right of the decimal
        self.valid_denominators = [2, 3, 4, 5, 8, 10, 12]
        
        self.mixed = 0
        self.improper = 0
        self.unreduced = 1
        self.force_same_denom = 0
        
#generates a question subset
#EXPECTS: config object, subclassed from core.config
#RETURNS: (selector, [ (answer, gate1, gate2, ...), (answer, gate1, gate2, ...), ... ]
#RETURNS: None, which causes the generator to try again with a random config
def generate(config):
    #Build a ranadom gate pattern that prevents staying in one lane (i.e. 222)
    #Note that a series of these patterns still have degenerate cases (ie 122 221 112 221 )
    pattern = [RC([0, 1]), RC([1, 2]), RC([0, 2]), RC([0, 1]), RC([1, 2]), RC([0, 2]), 
               RC([0, 1]), RC([1, 2]), RC([0, 2]), RC([0, 1]), RC([1, 2]), RC([0, 2]), 
               RC([0, 1]), RC([1, 2]), RC([0, 2]), RC([0, 1]), RC([1, 2]), RC([0, 2])]
    gates = []
    
    selector = 1

    #finish remaining gates after edge cases
    while(len(gates) < len(pattern)):
        l = 0
        r = 0
        d1 = RC(config.valid_denominators)
        if(config.force_same_denom):
            d2 = d1
        else:
            d2 = RC(config.valid_denominators)
        
        #case smaller
        if(pattern[len(gates)] == 0):
            n1 = RI(d1 + 1, config.num_max)
            
            temp = i_hate_fractions(F(n1, d1), d2)
            
            n2 = RI(temp, max(config.num_max, temp + 3))
            
        #case between
        elif(pattern[len(gates)] == 1):
            n1 = RI(1, d1 - 1)
            n2 = RI(d2 + 1, config.num_max)
        
        #case larger
        elif(pattern[len(gates)] == 2):
            n2 = RI(config.num_min, d2 - 1)
            
            temp = i_hate_fractions(F(n2, d2), d1)
            
            if(temp - 1 < 2):
                n1 = temp - 1
            else:
                n1 = RI(config.num_min, temp - 1)
        
        if(config.unreduced):
            gates.append( (str(pattern[len(gates)]), str(n1) + " / " + str(d1), str(n2) + " / " + str(d2)) )
        else:
            gates.append( (str(pattern[len(gates)]), str(F(n1, d1)), str(F(n2, d2))) )
        
    #randomize the order of the gates
    i = 0
    while(i<18):
        random.shuffle(gates[i:i+2])
        i += 3
    
    return (str(selector), gates)

def i_hate_fractions(f, d2):
    i = 1
    while(f > F(i, d2)):
        i += 1
    return i
    
###############################################################################

#generate/build/load needed configs here
#IMPORTANT: Only the first config is used by core.runBatch
#IMPORTANT: All configs are passed at random to your generate_func
configs = [newConfig('ft1_racecar', 'f1header.xml', 'private\\test4\\', 'set')]
configs[0].subsets_per_set = 1
configs[0].datasets_per_run = 1

#Load config(s)
if(LOAD_PREVIOUS_CONFIG):
    temp = configs[0].loadConfig(configs[0].directory + "generator_config")
    if(temp != None):
        configs[0] = temp

#Generate questions
if(GENERATE):
    core.runBatch(configs, generate)

#Save config(s)
if(SAVE_CURRENT_CONFIG):
    configs[0].saveConfig(configs[0].directory + "generator_config")