import core
import random
import fractions

#Shortcut abbreviations
RI = random.randint
RC = random.choice
F = fractions.Fraction

class fractionItem:
    def __init__(self):
        self.foo = 'bar'
        self.reduced = {}
        self.unreduced = {}
        self.denominators = [2, 3, 4, 5, 8, 10, 12, 100, 1000]
        
        # Iterate over valid denominators
        for d in self.denominators:
            self.reduced[d] = [(0, d)]
            self.unreduced[d] = [(0, d)]
            
           #Iterate over valid numerators for the current denominator
            for n in range(1, d):
                if(n%d != 0):
                    self.reduced[d].append((n, d))
                self.unreduced[d].append((n, d))

    # Returns a random valid denominator
    def getRD(self):
        return RC(self.denominators)
    
    # Get a random unreduced fraction
    def get(self):
        return RC(self.unreduced[self.getRD()])
    
    # Syntatic suger
    def getSmaller(self, fract):
        return self.getConditionally(fract, operator.lt, w)
    
    # Syntatic suger    
    def getLarger(self, fract):
        return self.getConditionally(fract, operator.gt, w)
    
    # Get a random fraction satisfying a condition
    def getConditionally(self, fract, conditional):
        f = F(fract)
        attempt = 0
        while(attempt < 10):
            r = this.get()
                
            if(conditional(F(r), f)):
                return r
        return None
        
    # Returns a unreduced improper fraction given a whole number and a (numerator, denominator)
    def makeImproper(self, w, f):
        return (w * f[1] + f[0], f[1])

    # Returns a mixed number given an improper fraction
    def makeMixed(self, f):
        w = f[0] / f[1]
        return (f[0] % f[1], f[1], w)

FI = fractionItem()

#TODO: Make static?
class decimalItem:
    def __init__(self):
        pass
    
    # Returns a random Decimal with the specified magnitude and number of digits
    def get(self, d, m):
        r = RI(0, 10 ** d)
        return D(r) ** (m - d)
        
    # Gets a value that satisfies a conditional function
    def getConditionally(self, val, conditional, d, m):
        attempt = 0
        while(attempt < 10):
            r = this.get(d, m)
            if(conditional(r, val)):
                return r
        return None
        
    # Syntatic suger
    def getSmaller(self, val, d, m):
        return self.getConditionally(val, operator.lt, d, m)
    
    # Syntatic suger    
    def getLarger(self, val, d, m):
        return self.getConditionally(val, operator.gt, d, m)
        
DI = decimalItem()