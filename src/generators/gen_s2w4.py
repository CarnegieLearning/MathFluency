import core
import random
import level_output

#Shortcut abbreviations
RI = random.randint
RC = random.choice

#generator specific configuration settings
class configN2(core.config):
    def __init__(self, eng, header, dir, name):
        core.config.__init__(self, eng, header, dir, name)
        
        self.toXML = level_output.CraneGame_toXML
        
        self.validLead = [0, 1, 2, 3, 4]#, 5, 6, 7, 8, 9]
        self.valid = [
                      #.01, .02, .03, .04, .06, .07, .08, .09,
                      .05, .15, .25, .35, .45, .55, .65, .75, .85, .95,
                      .10, .20, .30, .40, .50, .60, .70, .80, .90]
                      #.1,  .2,  .3,  .4,  .5,  .6,  .7,  .8,  .9]

        self.subsets_per_set = 1
        self.datasets_per_run = 40
        self.outputCSV = 0

    def toPercent(self, val):
        return str(val * 100)[:-2] + '%'
        
    def generate(self):
        #line = (("0", core.strContent(0)), ("0.25", core.strContent(0.25)), ("0.5", core.strContent(0.5)), ("0.75", core.strContent(0.75)), ("1", core.strContent(1)))
        line = []
        for i in range(0, 6):
            line.append((str(i/5.0), core.strContent(i)))
            
        questions = []
        
        i = 0
        while(i < 30):
            val = RC(self.valid)
            lead = RC(self.validLead)
            
            if(val < .099 and (val > .051 or val < 0.49) and lead != 0):
                continue
            
            #sVal = str(val)[1:]
            
            if(lead > 0 or RI(0, 1)):
                sVal = str(lead) + str(val)
            
            sVal = (lead + val) / 5.0
            
            questions.append((str(sVal), core.strContent(self.toPercent(lead + val))))
            
            i += 1
        
        return [line, questions]
    
#generate/build/load needed configs here
configs = [configN2('ft2_crane', 'f2header_s2w4.xml', 'private/s2w4c6/', 's2w4c6_set')]

#Generate questions
core.runBatch(configs)