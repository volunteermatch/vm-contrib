### This is VolunteerMatch's Sample Partner Test Project.  This test tool includes:
* A sample UI for the user to login to VolunteerMatch's system.
* A client UI to show the user's organization's admin dashboard page
  (simple user info and the opportunities she manages after the user has successfully logged unto VolunteerMatch's system.)
* Some simple functionality for the user to create and update opportunities.

## Install the environment
1. install node.js (if you already have node.js installed, make sure the version is v10.10.0 or higher)

2. Install npm if you don't already have it. NPM version should be 6.4.1 or higher. To pull down dependencies, run:

```bash
npm install
```

## Setup the necessary configuration
1. Setup VolunteerMatch login url: in ~/samplePartner/config/default.js, replace line 1

        let baseurl = '<VolunteerMatch login url>';
    with VolunteerMatch's actual login URL

2. Setup client id and secret: in ~/samplePartner/config/default.js,

        clientid: '<my client id>',
        client_secret: '<my client secret>',
   with your client id and client secret

3. Setup VolunteerMatch's API URL: in ~/samplePartner/config/default.js, replace line 14

        api_url: '<VolunteerMatch API url>'
    with VolunteerMatch's actual API URL

### Run and test the program:
1. From your samplePartner directory, run:

```bash
npm start
```

2. Use a browser and navigate to http://localhost:3000/, and you should see this partner tool's first page, "Access VolunteerMatch"

3. Click on "Authorize", and you will be taking to Volunteermatch's login dialog.
  After a successful sign-in, you will see the user info and organization's dashboard page.
  (Please note that you will need to sign in to an organization's admin account in order to see an organization's dashboard.
  If the account you signed in is not an organization's admin, you will only see your personal info and no organization info)

4. In the Organization's dashboard (or user info) page:
  * If your account's organization has no opportunities, you can create an opportunity by clicking on the "Create an opportunity" link.
  * If your organization has opportunities, you will see both the "Create an opportunity" link, and a list of opportunities.
  * You can edit each opportunities title or description by typing the new title or description in the text box and click on submit changes.
  * If the edit was successful, you will see a message "Update successful" at the top of the opportunity list.
  * If you have no organizations under your account, you will still see a create opportunity link, but your creation will fail if you try to use that link.
