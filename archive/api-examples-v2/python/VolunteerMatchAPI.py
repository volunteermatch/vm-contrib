import base64
import datetime
import hashlib
import json
import os
import requests


class importOpportunities():
    """ Imports volunteering opportunities from the Volunteer Match api (https://www.volunteermatch.org/) and
        exports them as json files that can be consumed by web applications.

        Ongoing and date bound opportunities are accessed separately to reduce load on the api.

        Attributes:
            username: A string representing your volunteermatch username.
            secret: A string representing your volunteermatch secret.
            ongoing: A boolean flag to request to toggle between ongoing and date bound opportunities. Defaults to False

        To use:
            Configure the self.query object with the parameters you wish to use and
            update your timezone from -0500 below.  Then execute the script via:
            execfile("VolunteerMatchAPI.py")
            importOpportunities(username='yourUsername', secret='yourSecret', ongoing=False)
    """

    def __init__(self, username, secret, ongoing=False):
        additionalDays = 60  # Number of days in the future to search for opportunities
        created = datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S-0500")
        nonce = hashlib.sha1().hexdigest()
        passwordDigest = base64.b64encode(hashlib.sha256((nonce+created+secret).encode('utf-8')).digest())
        self.ongoing = ongoing
        self.url = 'http://www.volunteermatch.org/api/call'
        self.headers = {'Authorization': 'WSSE profile="UsernameToken"',
                        'X-WSSE': u'UsernameToken Username="{}", PasswordDigest="{}", Nonce="{}", Created="{}"'.format(
                            username, passwordDigest, nonce, created)
                        }
        self.numberOfResults = 20
        self.query = {"location": "New York, NY"}
        if ongoing:
            self.query["dateRanges"] = [{"ongoing": True}]
        else:
            self.query["dateRanges"] = [{
                "startDate": datetime.datetime.now().strftime("%Y-%m-%d"),
                "endDate": (datetime.datetime.now() + datetime.timedelta(days=additionalDays)).strftime("%Y-%m-%d")
            }]

        self.getOpportunities(page=1)

    def getOpportunities(self, page=1, combinedResults=dict()):
        """ Download a page of results, then parse and send them to . Then fetch the next page.
            If this is the last page write out the complete list.
            The api's page count starts at 1, not 0.
        """
        self.query['pageNumber'] = page
        params = {
            'action': 'searchOpportunities',
            'query': json.dumps(self.query).replace('"', '\"')
        }
        res = requests.get(self.url, headers=self.headers, params=params)
        if page == 1:
            print('Attempting to load ' + str(json.loads(res.content)['resultsSize']) + ' results')

        for opportunity in json.loads(res.content)['opportunities']:
            zipcode = opportunity['location']['postalCode']
            if zipcode not in combinedResults:
                combinedResults[zipcode] = list()

            combinedResults[zipcode].append({
                'zipcode': opportunity['location']['postalCode'],
                'description': opportunity['plaintextDescription'],
                'org': opportunity['parentOrg']['name'],
                'title': opportunity['title'],
                'end': opportunity['availability']['endDate'],
                'link': opportunity['vmUrl']
            })

        if page * 20 >= json.loads(res.content)['resultsSize']:
            self.writeResultsToFile(combinedResults)
        else:
            self.getOpportunities(page=(page + 1), combinedResults=combinedResults)

    def writeResultsToFile(self, combinedResults):
        if self.ongoing:
            datafile = os.path.join(os.getcwd(), 'ongoingOpportunities.json')
        else:
            datafile = os.path.join(os.getcwd(), 'datedOpportunities.json')

        with open(datafile, 'w') as outfile:
                json.dump(combinedResults, outfile)

        exportedCount = reduce((lambda x, y: x + y), map(lambda x: len(combinedResults[x]), combinedResults.keys()))
        print('Successfully exported ' + str(exportedCount) + ' opportunities.')
