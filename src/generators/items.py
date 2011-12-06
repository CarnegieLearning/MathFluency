import core
import random
import fractions
import operator

#Shortcut abbreviations
RI = random.randint
RC = random.choice
F = fractions.Fraction

class FractionItem:
    def __init__(self, denom = [2, 3, 4, 5, 8, 10, 12, 100, 1000]):
        self.reduced = {}
        self.unreduced = {}
        self.denominators = denom
        
        self.include_0 = 0
        self.include_1 = 0
        
        # Iterate over valid denominators
        for d in self.denominators:
            self.reduced[d] = []
            self.unreduced[d] = []
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
    def getSmaller(self, fract, d=None):
        return self.getConditionally(fract, operator.lt, d)
    
    # Syntatic suger    
    def getLarger(self, fract, d=None):
        return self.getConditionally(fract, operator.gt, d)
    
    # Get a random fraction satisfying a condition
    def getConditionally(self, fract, conditional, d=None):
        attempt = 0
        while(attempt < 10):
            if(d == None):
                r = self.get()
            else:
                r = RC(self.unreduced[d])
            
            if(conditional(F(r[0], r[1]), fract)):
                return r
            attempt += 1

        return None
        
    # Returns a unreduced improper fraction given a whole number and a (numerator, denominator)
    def makeImproper(self, w, f):
        return (w * f[1] + f[0], f[1])

    # Returns a mixed number given an improper fraction
    def makeMixed(self, f):
        w = f[0] / f[1]
        return (f[0] % f[1], f[1], w)
    
    # Include fraction equal to zero if they are not already included
    def include0(self):
        if(not self.include_0):
            self.include_0 = 1
            for k, d in self.unreduced.iteritems():
                d.append((0, k))
                d.sort()
            
    # Exclude fraction equal to zero if they are not already excluded
    def exclude0(self):
        if(self.include_1):
            self.include_1 = 0
            for k, d in self.unreduced.iteritems():
                d.remove((0, k))

    # Include fraction equal to one if they are not already included
    def include1(self):
        if(not self.include_1):
            self.include_1 = 1
            for k, d in self.unreduced.iteritems():
                d.append((k, k))
    
    # Exclude fraction equal to one if they are not already excluded            
    def exclude1(self):
        if(self.include_1):
            self.include_1 = 0
            for k, d in self.unreduced.iteritems():
                d.remove((k, k))

FI = FractionItem()

#TODO: Make static?
class DecimalItem:
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
            attempt += 1
        return None
        
    # Syntatic suger
    def getSmaller(self, val, d, m):
        return self.getConditionally(val, operator.lt, d, m)
    
    # Syntatic suger    
    def getLarger(self, val, d, m):
        return self.getConditionally(val, operator.gt, d, m)
        
DI = DecimalItem()