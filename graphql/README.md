## VolunteerMatch Open Network API V3
Welcome to the Open Network API V3, built with GraphQL. This API grants access to the [VolunteerMatch Open Network](https://www.volunteermatch.org).

### Getting Started
GraphQL is a flexible data query language that allows you to define API call responses to match your use case. New to GraphQL? Check out the [offical docs](http://graphql.org) or [How To GraphQL](https://www.howtographql.com) to get started.

You can familiarize yourself with the Open Network API, view the API schema, and start making calls right away with our [GraphiQL plugin](https://www.stage.volunteermatch.org/s/graphiql)

### Documentation
See our [best practices documentation](https://media.volunteermatch.org/docs/api/OpenNetworkAPIv3BestPractices.pdf) for how to best integrate VolunteerMatch content into your application. Detailed query/mutation documentation can be retrieved and viewed with the GraphQL client of your choosing (see below) or [online](https://impactonline.atlassian.net/wiki/spaces/VONA/pages/1573781549/Best+Practices+for+the+VolunteerMatch+Open+Network+Opportunities+API).

### Getting an API Key
To request an API key, please [contact us](https://solutions.volunteermatch.org/contact-us/)!

### Making calls
All testing should be done in our staging environment. Our endpoints URLs are currently:
* Staging: https://graphql.stage.volunteermatch.org/graphql
* Production: https://graphql.volunteermatch.org/graphql

Your initial API key will be issued for the staging environment. Your API key must be included as the value for the HTTP X-api-key header in every request. 

Once you have an API Key, you can either download and run a GraphQL client, or jump right into our [example code](#example-code). Note that all calls currently must be made via POST with content type of *application/json* - GET is not supported in the current API, nor is content type of *application/graphql*.

#### Recommended GraphQL clients
* GraphiQL: https://electronjs.org/apps/graphiql
* Altair GraphQL client: https://altair.sirmuel.design/

#### Example code
See the following subdirectories, and follow the instructions in their README to get up and running.
* currently we have example code in [Node.js](https://github.com/volunteermatch/vm-contrib/edit/master/graphql/nodejs/)
