import core
import random
import level_output
import items

#Shortcut abbreviations
RI = random.randint
RC = random.choice

#generator specific configuration settings
class configN2(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
        
        self.toXML = level_output.CraneGame_toXML
        
        self.valid = items.FractionItem([2, 3, 4, 5, 8, 10])

        self.subsets_per_set = 1
        self.datasets_per_run = 40
        
    def generate(self):
        line = (("0", core.strContent(0)), ("0.25", core.strContent(0.25)), ("0.5", core.strContent(0.5)), ("0.75", core.strContent(0.75)), ("1", core.strContent(1)))
        #line = (("0", core.strContent(0)), ("0.5", core.strContent(0.5)), ("1", core.strContent(1)))
            
        questions = []
        prev = (0, 0)
        val = (0, 0)
        
        i = 0
        while(i < 20):
            while(val[0] == prev[0] and val[1] == prev[1]):
                val = self.valid.get();
            
            sVal = str((val[0] * 1.0) / val[1])
            if(len(sVal) > 5):
                sVal = sVal[0:5]
            
            questions.append((sVal, core.frtContent(val[0], val[1])))
            
            i += 1
            val = prev
        
        return [line, questions]
    
#generate/build/load needed configs here
configs = [configN2('ft2_crane', 'f2header_s2w4.xml', 'private/s2w5c6/', 's2w5c6_set')]

#Generate questions
core.runBatch(configs)