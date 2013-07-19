function loadScript(url) {
  var scriptElement=document.createElement('script');
  scriptElement.setAttribute("type","text/javascript");
  scriptElement.setAttribute("src", url);
  document.getElementsByTagName("head")[0].appendChild(scriptElement);
}

function loadCss(url) {
  var cssElement=document.createElement('link');
  cssElement.setAttribute("type","text/css");
  cssElement.setAttribute("rel","stylesheet");
  cssElement.setAttribute("src", url);
  document.getElementsByTagName("head")[0].appendChild(cssElement);
}

loadScript("//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js");
loadScript("//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js");
loadScript("//www.nextrel.volunteermatch.org/include/js/lib/json2.min.js");
loadCss("//code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css");

// authentication headers for API requests
var authenticationHeaders = {
  "X-WSSE": wsseCredentials,
  "Authorization": "WSSE profile=\"UsernameToken\""
};

var testParameters = {
    "location": "mountain view, ca",
        "opportunityTypes": ["public"],
        "orgNames": ["red cross"],
        "fieldsToDisplay": ["id", "title", "location", "plaintextDescription", "description"]
};

$(function () {
  // metaData for the API Key/site
  var metaData = null;
  
  // we will use CORS headers to facilitate certain cross-domain requests (from JSFiddle only)
  jQuery.support.cors = true;
  
  $(function () {
      $("#accordion").accordion({
          fillSpace: true
      });
  });
  
  var form = $("<div>");
  form.load("//raw.github.com/volunteermatch/vm-contrib/master/api-examples/javascript/js/opportunity_widget.html");
  
  $(body).append(form);
  
  /** Begin Test API call submission code */
  
  /** submit the parameters/action to the API, using WSSE authentication token */
  $('#test_api_call').submit(function () {
    $('#call_result').text("Loading...");
      $.ajax({
          url: authenticationParameters["apiUrl"] + '/api/call',
          data: {
              action: "searchOpportunities",
              query: JSON.stringify(testParameters)
          },
          headers: authenticationHeaders,
          dataType: 'json',
          type: $("input[name=method]").val(),
          success: function (data) {
              if (data == null) {
                  //some API calls simply return an HTTP success status code.
                  $('#call_result').css('color', 'green').html($("<p>").text("The API call completed successfully."));
              } else {
                  function addColumn(row, dataSource, field) {
                      if (field == 'description') {
                          row.append($('<td></td>').html(dataSource[field]));
                      } else {
                          row.append($('<td></td>').text(dataSource[field]));
                      }
                  }
                  var fields = ['id', 'title', 'description'];
                  var displayNames = ['ID', 'Title', 'Description'];
                  var firstRow = $('<tr></tr>');
                  $.each(displayNames, function (idx, value) {
  
                      firstRow.append($('<td></td>').text(value));
                  });
                  $('#tableDiv table').append(firstRow);
                  $.each(data.opportunities, function (idx, value) {
                      var row = $("<tr></tr>");
                      $.each(fields, function (idx, fieldName) {
                          addColumn(row, value, fieldName);
                      });
                      $('#tableDiv table tr:last').after(row);
                  });
  
                  $('#call_result').css('color', 'green').html($("<p>").text("Results")).append($("<pre>").text(js_beautify(JSON.stringify(data), {
                      indent_size: 4,
                      indent_char: ' '
                  })));
                  //scroll Test API section to ensure call results container appears
                  $('#call_result').closest('.ui-accordion-content').scrollTop($("#call_result").position().top - 200);
              };
          },
          error: function (data) {
              $('#call_result').text('Failed. Error :' + JSON.stringify(data.statusText)).css('color', 'red');
          },
      });
  
      return false;
  });
  
  /** end Test API call submission code */
});
