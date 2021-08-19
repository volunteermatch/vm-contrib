var cc = DataStudioApp.createCommunityConnector();
var DEFAULT_PACKAGE = '2021-06-01 to 2021-08-31';

// [START get_config]
// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig() {
  var config = cc.getConfig();

  config
      .newInfo()
      .setId('instructions')
      .setText(
          'Click Connect to View supported data columns'
      );

  config
      .newTextInput()
      .setId('dateRange')
      .setName(
          'Enter a date range in this format: 2021-07-01 to 2021-08-12'
      )
      .setHelpText('e.g. "2021-04-01 to 2021-08-12"')
      .setPlaceholder(DEFAULT_PACKAGE)
      .setAllowOverride(true);

  config.setDateRangeRequired(true);


  return config.build();
}
// [END get_config]

// [START get_schema]
function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;

  fields
      .newDimension()
      .setId('container')
      .setName('Tier Name')
      .setType(types.TEXT);

  fields
      .newDimension()
      .setId('date')
      .setName('date')
      .setType(types.YEAR_MONTH_DAY);

  fields
      .newDimension()
      .setId('oppCount')
      .setName('Opportunities count')
      .setType(types.NUMBER);

  fields
      .newDimension()
      .setId('orgId')
      .setName('Organization Id')
      .setType(types.NUMBER);

  fields
      .newDimension()
      .setId('orgCity')
      .setName('Organization City')
      .setType(types.TEXT);

  fields
      .newDimension()
      .setId('orgName')
      .setName('Organization Name')
      .setType(types.TEXT);
  fields
      .newDimension()
      .setId('connectionId')
      .setName('Connection Id')
      .setType(types.NUMBER);

  fields
      .newMetric()
      .setId('connectionCount')
      .setName('Connection Count')
      .setType(types.NUMBER);

  return fields;
}

// https://developers.google.com/datastudio/connector/reference#getschema
function getSchema(request) {
  return {schema: getFields().build()};
}

function isAdminUser() {
  return true;
}

function getData(request) {

  var requestedFields = getFields().forIds(
      request.fields.map(function(field) {
        return field.name;
      })
  );
//  console.log('start and end date');
//  console.log(request.dateRange.startDate);
//  console.log(request.dateRange.endDate);

  try {
    var apiResponse = fetchDataFromApi(request);
    var normalizedResponse = normalizeResponse(request, apiResponse);
    var data = getFormattedData(normalizedResponse, requestedFields);

    console.log('normalized response');
    console.log(normalizedResponse);

  } catch (e) {
    cc.newUserError()
        .setDebugText('Error fetching data from API. Exception details: ' + e)
        .setText(
            'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
        )
        .throwException();
  }
  var schemaFields = requestedFields.build();
  console.log(schemaFields);
  console.log('schema top, data bottom');
  console.log(data);

  return {
    schema: schemaFields,
    rows: data
  };
}

function fetchDataFromApi(request) {
  var data1 = {
    "query":
        "query{getConnectionReport("+
        "  input:{"+
        "  containers:[\"tier0ca\", \"tier1ca\", \"tier2ca\", \"tier3ca\"]"+
        "  dateRange: \""+request.dateRange.startDate+ " to "+     request.dateRange.endDate + "\""+
        " }){"+
        "  numberOfResults"+
        "    connections{"+
        "      activeOppCount"+
        "      connectionCount"+
        "      orgId"+
        "      orgCity"+
        "      orgName"+
        "      containerName"+
        "      date"+
        "      connectionId"+
        "    }"+
        "}}"
  };

  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(data1)
  };
  var httpResponse = UrlFetchApp.fetch('https://www.hsue.impactonline.org/s/report', options);

  return httpResponse;
}

function normalizeResponse(request, responseString) {
  var jsonObj = JSON.parse(responseString);
  var containerRefs = jsonObj.data.getConnectionReport.connections;

  return containerRefs;
}

function getFormattedData(response, requestedFields) {
  var data = [];
  response.forEach(ref=> {
    var formattedData = formatData(requestedFields, ref);
    data = data.concat(formattedData);
  });
  return data;
}

function formatData(requestedFields, ref) {

  var row = requestedFields.asArray().map(function(requestedField) {

    switch (requestedField.getId()) {
      case 'container':
        return ref.containerName;
      case 'activeOppCount':
        return ref.activeOppCount;
      case 'connectionCount':
        return ref.connectionCount;
      case 'orgId':
        return ref.orgId;
      case 'orgCity':
        return ref.orgCity;
      case 'orgName':
        return ref.orgName;
      case 'connectionId':
        return ref.connectionId;
      case 'date':
        return ref.date.replace(/-/g, '');
      default:
        return '';
    }
  });
  return {values: row};
}