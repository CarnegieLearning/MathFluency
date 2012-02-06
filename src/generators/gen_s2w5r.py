import core
import items
import random
import level_output

#Shortcut abbreviations
RI = random.randint
RC = random.choice

#generator specific configuration settings
#EXPECTS: engine string, header file location, output directory, output filename
#NEEDS TO: pass expectations to core.config's __init__
#IMPORTANT: core.config expects a function "def generate(self):" to be defined
class configR2(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
        
        i = 0
        v1 = []
        v2 = []
        while(i < 10):
            j = 0
            while(j < 0.99):
                v1.append(i + j)
                j += 0.1
            
            j = 0
            while(j < 0.99):
                v2.append(i + j)
                j += 0.25
                
            i += 1
        
        v1.append(10)
        v2.append(10)
        
        self.valid = [[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], [0, 0.25, 0.5, 0.75, 1]]
        #self.valid = [v1, v2]
        
        self.player = []
        i = 1
        while(i < 100):
            self.player.append(i/100.0)
            i += 1
        
        self.subsets_per_set = 4
        self.datasets_per_run = 40
        
        self.prev = 0.00
        self.prevA = 'u'
        
        self.toXML = level_output.Racecar_toXML;
    
    #generates a question subset
    def generate(self):
        subset = []
        
        player = RC(self.player)
        while(player == self.prev):
            player = RC(self.player)
    
        i = 0
        while(i < 4):
            f = RI(0, 1)
            f1 = 0
            f2 = len(self.valid[f]) - 1
            while(f1 == 0 and f2 == len(self.valid[f]) - 1):
                f1 = RI(0, len(self.valid[f]) - 2)
                f2 = RI(f1 + 1, len(self.valid[f]) - 1)
                
            f1 = self.valid[f][f1]
            f2 = self.valid[f][f2]
            
            if(f1 == player or f2 == player):
                continue
            
            ans = 'u'
            if(player < f1):
                ans = '0'
            elif(player < f2):
                ans = '1'
            else:
                ans = '2'
                
            if(self.prevA == ans and RI(0, 8) > 2):
                continue
                
            subset.append((ans, core.strContent(str(f1)), core.strContent(str(f2))))
            self.prev = player
            self.prevA = ans
        
            i += 1
    
        return (core.strContent(str(player)), subset)
    
###############################################################################

#generate/build/load needed configs here
configs = [configR2('ft1_racecar_html5', 'f1header_s2w5.xml', 'private/s2w5r1/', 's2w5r1_set')]

#Generate questions
core.runBatch(configs)