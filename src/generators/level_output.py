import xml.dom.minidom

#Shortcut abbreviations
Element = xml.dom.minidom.Element

#Globals
TRUE = 1
FALSE = 0

xml_question_num = 1

###################################################################################################

#Converts internal dataset representation to XML
#IMPUT: dataset should be a list of subsets
def Racecar_toXML(dataset):
    global xml_question_num
    xml_question_num = 1
    
    allQuestions = Element("PROBLEM_SET")
    
    for subset in dataset:
        allQuestions.appendChild(Racecar_XMLSubset(subset))
        
    return allQuestions
    
#Converts a question subset into its XML equivalent
#INPUT: subset should be [selector, (answer, delim1, delim2, ...), (answer, delim1, delim2, ...), ...]
def Racecar_XMLSubset(subset):
    selector, questions = subset
    
    subset = Element("PROBLEM_SUBSET")
    target = Element("TARGET")
    target = selector.toXML(target)
    subset.appendChild(target)
    
    for q in questions:
        subset.appendChild(Racecar_XMLQuestion(q))
        
    return subset
    
#Converts a question into its XML equivalent
#INPUTL (answer, delim1, delim2, ...)
def Racecar_XMLQuestion(q):
    global xml_question_num
    question = Element("QUESTION")
    question.setAttribute("INDEX", str(xml_question_num))
    xml_question_num += 1
    
    i = 1
    while(i < len(q)):
        c = Element("Content")
        c = q[i].toXML(c)
        question.appendChild(c)
        
        i += 1
        
    ans = Element("Answer")
    ans.setAttribute("VALUE", q[0])
    question.appendChild(ans)
    
    return question

###################################################################################################
    
#Converts internal dataset representation to XML
#IMPUT: dataset should be a list of subsets
def CraneGame_toXML(dataset):
    global xml_question_num
    xml_question_num = 1
    
    allQuestions = Element("PROBLEM_SET")
    
    for subset in dataset:
        allQuestions.appendChild(CraneGame_XMLSubset(subset))
        
    return allQuestions
    
#Converts a question subset into its XML equivalent
#INPUT: subset should be ([(hash location, hash content), ...], [(answer, question content), ...])
def CraneGame_XMLSubset(subset):
    nline, questions = subset
    
    subset = Element("PROBLEM_SUBSET")
    numberline = Element("NUMBER_LINE")
    for hash in nline:
        h = Element("HASH")
        h.setAttribute("location", hash[0])
        c = Element("Content")
        c = hash[1].toXML(c)
        h.appendChild(c)
        numberline.appendChild(h)
    
    subset.appendChild(numberline)
    
    for q in questions:
        subset.appendChild(CraneGame_XMLQuestion(q))
        
    return subset

#Converts a question into its XML equivalent
#INPUT: (answer, question content)
def CraneGame_XMLQuestion(q):
    global xml_question_num
    question = Element("QUESTION")
    question.setAttribute("INDEX", str(xml_question_num))
    xml_question_num += 1
    
    if(len(q) > 1):
        c = Element("Content")
        c = q[1].toXML(c)
        question.appendChild(c)
        
    ans = Element("Answer")
    ans.setAttribute("VALUE", q[0])
    question.appendChild(ans)
    
    return question
    
###################################################################################################

#Hurix Legacy Format - Converts internal dataset representation to XML
def Legacy_toXML(dataset):
    global xml_question_num
    xml_question_num = 1
    
    allQuestions = Element("PROBLEM_SET")
    
    for subset in dataset:
        allQuestions.appendChild(XMLSubsetLegacy(subset))
        
    return allQuestions

#Hurix Legacy Format - Converts a question subset into its XML equivalent
def XMLSubsetLegacy(subset):
    selector, questions = subset
    
    subset = Element("PROBLEM_SUBSET")
    target = Element("TARGET")
    if(not "IMAGE:" in selector):
        target.setAttribute("TYPE", "text")
        target.setAttribute("VALUE", selector)
    else:
        target.setAttribute("TYPE", "Image")
        target.setAttribute("VALUE", selector[6:])
    subset.appendChild(target)
    
    for q in questions:
        subset.appendChild(XMLQuestionLegacy(q))
        
    return subset

#Hurix Legacy Format - Converts a single question into its XML equivalent
def XMLQuestionLegacy(q):
    global xml_question_num
    question = Element("QUESTION")
    question.setAttribute("INDEX", str(xml_question_num))
    xml_question_num += 1
    
    text = Element("DELIMETERS_TEXT")
    image = Element("DELIMETERS_IMAGE")
    
    i = 1
    while(i < len(q)):
        e = Element("DELIMETER")
        if(not "IMAGE:" in q[i]):
            e.setAttribute("VALUE", q[i])
            text.appendChild(e)
        else:
            e.setAttribute("VALUE", q[i][6:])
            image.appendChild(e)
        i += 1
                
            
    question.appendChild(text)
    question.appendChild(image)
    
    e = Element("ANSWER")
    e.setAttribute("VALUE", q[0])
    question.appendChild(e)
    
    return question
    
###################################################################################################