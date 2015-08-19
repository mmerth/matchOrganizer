import re
import urllib2
import simplejson as json

stationList = {
    "1":{"available":"yes"},
    "2":{"available":"yes"},
    "3":{"available":"yes"},
    "4":{"available":"yes"},
    "5":{"available":"yes"},
    "6":{"available":"yes"},
    "7":{"available":"yes"},
    "8":{"available":"yes"},
    "9":{"available":"yes"},
}



def parseURL(tournamentURL):
    if re.match('http://[^\.]+\.challonge\.com/.*', tournamentURL):
        return re.sub('http://(.*)\.challonge.com/(.*)', '\\1-\\2', tournamentURL)
    else:
        return re.sub('http://challonge\.com/(.*)', '\\1', tournamentURL)
    
def getParticipants(userName, apiKey, tourneyName):
    auth_handler = urllib2.HTTPBasicAuthHandler()
    req = urllib2.Request("https://api.challonge.com/v1/tournaments/%s/participants.json" % (tourneyName))
    auth_handler.add_password(
        realm = "Application",
        uri = req.get_full_url(),
        user = userName,
        passwd = apiKey
    )
    opener = urllib2.build_opener(auth_handler)
    response = opener.open(req)
    responseAsDict = json.load(response)
    response.close()
    return responseAsDict
    
def getMatches(userName, apiKey, tourneyName):
    auth_handler = urllib2.HTTPBasicAuthHandler()
    req = urllib2.Request("https://api.challonge.com/v1/tournaments/%s/matches.json" % (tourneyName))
    auth_handler.add_password(
        realm = "Application",
        uri = req.get_full_url(),
        user = userName,
        passwd = apiKey
    )
    opener = urllib2.build_opener(auth_handler)
    response = opener.open(req)
    responseAsDict = json.load(response)
    response.close()
    return responseAsDict

def updateMatch(userName, apiKey, tourneyId, matchId, score, winnerId):
    #build the match object to update
    matchData = json.dumps({'match' : {'scores_csv' : score, 'winner_id' : winnerId}})
    auth_handler = urllib2.HTTPBasicAuthHandler()
    req = urllib2.Request("https://api.challonge.com/v1/tournaments/%s/matches/%s.json" % (str(tourneyId), str(matchId)), data = matchData)
    req.add_header('Content-Type', 'application/json')
    req.get_method = lambda: 'PUT'
    auth_handler.add_password(
        realm = "Application",
        uri = req.get_full_url(),
        user = userName,
        passwd = apiKey
    )
    opener = urllib2.build_opener(auth_handler)
    response = opener.open(req)
    responseAsDict = json.load(response)
    response.close()
    return responseAsDict

