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
class configR2(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
        
        self.mixed = 0      #If true, selectors will include mixed numbers
        self.improper = 0   #If true, selectors will include improper fractions
        self.reduced = 0    #TODO: If true, selectors will be in reduced form (note: 7/6 is 'reduced' for an improper fraction)
        self.sameD = 1      #Keeps all denominators the same on a single questions
        
        self.toXML = level_output.Racecar_toXML;
    
    #Formats the selector into a tuple of strings
    def formatSelector(self, s):
        if(self.mixed and s[0] > s[1]):
            if(not self.improper or RI(0,1)):
                return core.frtContent(str(s[0] - s[1]), str(s[1]), "1")
        return core.frtContent(str(s[0]), str(s[1]))
    
    #generates a question subset
    def generate(self):
        #return [self.genCommonD(0), self.genCommonN(0), self.genBench(0), self.generateProper()]
        return [self.genCommonD(1), self.genCommonN(1), self.genBench(1), self.generateImproper()]
        
    def generateProper(self):
        ss = []
        
        FI = items.FractionItem([2, 3, 4, 5, 8, 10, 12])
        
        sel = FI.get()
        selF = F(sel[0], sel[1])
        
        i=0
        while(i<5):
            f = None
            ans = RI(0, 1)
            if(ans == 1):
                f = FI.getSmaller(selF)
            else:
                f = FI.getLarger(selF)
            
            if(f):
                ss.append((str(ans), core.frtContent(f[0], f[1])))
                i += 1
            
        return (core.frtContent(sel[0], sel[1]), ss)
        
    def generateImproper(self):
        ss = []
        
        FI = items.FractionItem([])
        FI.denominators = [2, 3, 4, 5, 8, 10, 12]
        for d in FI.denominators:
            FI.unreduced[d] = []
            for n in range(1, 37):
                if(F(n, d) < 10.01):
                    FI.unreduced[d].append((n, d))
        
        sel = FI.get()
        selF = F(sel[0], sel[1])
        
        i = 0
        while(i < 5):
            f = None
            ans = RI(0, 1)
            if(ans == 1):
                f = FI.getSmaller(selF)
            else:
                f = FI.getLarger(selF)
            
            if(f):
                ss.append((str(ans), core.frtContent(f[0], f[1])))
                i += 1
            
        return (core.frtContent(sel[0], sel[1]), ss)
            
    def genCommonN(self, imp=0):
        ss = []
        v = [2, 3, 4, 5, 8, 10, 12]
        
        if(imp):
            commonN = RI(1, 20)
        else:
            commonN = RI(1, 4)
            v = v[commonN-1:]
            
        selD = RC(v)
        v.remove(selD)
        
        i=0
        while(i<5):
            i+=1
            d = RC(v)
            ans = 0
            if(d < commonN):
                ans = 1
            
            ss.append((str(ans), core.frtContent(commonN, d)))
            
        return (core.frtContent(commonN, selD), ss)

    def genCommonD(self, imp=0):
        ss = []
        
        if(imp):
            commonD = RC([2, 3, 4, 5, 8, 10, 12])
            selN = RI(2, min(commonD*10, 36))
        else:
            commonD = RC([5, 8, 10, 12])
            selN = RI(2, commonD-1)
        
        i=0
        while(i<5):
            i+=1
            
            n = selN
            while(n==selN):
                if(imp):
                    n = RI(1, min(commonD*10, 36))
                else:
                    n = RI(1, commonD)
                
            ans = 0
            if(n < selN):
                ans = 1
                
            ss.append((str(ans), core.frtContent(n, commonD)))
            
        return (core.frtContent(selN, commonD), ss)
    
    def genBench(self, imp=0):
        ss = []
        
        v = [2, 3, 4, 5, 8, 10, 12]
        
        bd = RI(1, 3) + 1
        val = F(1, bd)
        
        i=0
        while(i<5):
            i+=1

            n = 1
            d = bd
            while(n == 1 and d == bd):
                d = RC(v)
                if(imp):
                    n = RI(1, min(d*10, 36))
                else:
                    n = RI(1, d)
            
            ans = 0
            if(F(n, d) < val):
                ans = 1
                
            ss.append((str(ans), core.frtContent(n, d)))
        
        return (core.frtContent(1, bd), ss)
    
###############################################################################

#generate/build/load needed configs here
configs = [configR2('ft1_racecar_html5', 'f1header_s2w2.xml', 'private/s2w2_fract_2/', 's2w2f2_set')]
configs[0].subsets_per_set = 3
configs[0].datasets_per_run = 40
configs[0].outputCSV = 0

#Generate questions
if(GENERATE):
    core.runBatch(configs)