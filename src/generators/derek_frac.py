import items
import random

# Specify denominator range in constructor
F = items.FractionItem(range(2, 16))
F.include1()    # Fractions equal to one are not included by default
F.include0()    # And the same goes for fractions equal to zero

file = open('fractions01.txt', 'w')

# Write out 50x fractions <1
i = 0
while(i < 50):
    temp = F.get()
    file.write(str(temp[0]) + ' / ' + str(temp[1]) + '\n')
    i += 1
file.close()

i = 0
buff = []
# Generate 50x <1 and 50x >1
while(i < 50):
    buff.append(F.get())
    buff.append(F.makeImproper(1, F.get()))
    i += 1

# Shuffle the ordering so they do not alternate
random.shuffle(buff)

# Write out the randomized list to the file
file = open('fractions02.txt', 'w')
for item in buff:
    file.write(str(item[0]) + ' / ' + str(item[1]) + '\n')
file.close()