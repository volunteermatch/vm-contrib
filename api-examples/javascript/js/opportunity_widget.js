// authentication headers for API requests
var authenticationHeaders = false;
var authenticationParameters = {
    "apiKey": "257efdd580d767ee589a817fd09c39a1",
        "apiUrl": "http://www.prelive.impactonline.org",
        "apiUsername": "LinkedIn For Good"
};
var testParameters = {
    "location": "mountain view, ca",
        "opportunityTypes": ["public"],
        "orgNames": ["red cross"],
        "fieldsToDisplay": ["id", "title", "location", "plaintextDescription", "description"]
};

// metaData for the API Key/site
var metaData = null;

// we will use CORS headers to facilitate certain cross-domain requests (from JSFiddle only)
jQuery.support.cors = true;

$(function () {
    $("#accordion").accordion({
        fillSpace: true
    });
});

/** begin metadata initialization */

/** Call getMetaData API method to load custom fields, etc. This can happen onload - doesn't require authentication for acmecorp2 */
function getMetaData() {
    $.ajax({
        url: authenticationParameters["apiUrl"] + "/api/call",
        data: {
            action: 'getMetaData'
        },
        headers: authenticationHeaders,
        error: function () {
            $('#auth_result').text('Error calling getMetaData.  This demo will not work properly.').css('color', 'red');
        },
        success: function (data) {
            metaData = data;
            //setup "Generate Custom Fields" section for all available custom field types
            $('#generate_custom_fields_for_context').html("");
            $('#available_contexts').html("");
            $.each([
                ["member", "Employee"],
                ["referral", "Signup"],
                ["hoursTracking", "Hours Tracking"]
            ], function () {
                if (metaData[this[0] + "Fields"]) {
                    $('#generate_custom_fields_for_context').append($("<option>").text(this[1]).attr("value", this[0]));
                    $('#available_contexts').append($("<li>").text(this[1]));
                };
            });
        }
    });
};

/** end metadata initialization */

/** begin API authentication code */

/** 
 * Retrieve WSSE authentication token from service, using API URL, secret and username (optional) from authentication form.
 * NOTE - this method of retrieving WSSE authentication tokens is for DEMO purposes only.  You will need to implement your own method of building WSSE authentication tokens using "back-end" code in order to hide your API credentials from end-users.
 */
function authenticate() {
    authenticationHeaders = getAuthenticationHeadersForWSSE(authenticationParameters["apiKey"], authenticationParameters["apiUsername"]);

    verifyAuthentication();
};

function verifyAuthentication() {
    $.ajax({
        url: authenticationParameters["apiUrl"] + "/api/call",
        data: {
            action: 'getKeyStatus'
        },
        headers: authenticationHeaders,
        error: function () {
            $('#auth_result').text('An error occurred while authenticating.').css('color', 'red');
        },
        success: function (data) {
            $('#auth_result').text('Authenticated').css('color', 'green');
            getMetaData();
            loadTestApiParameters();
        }
    });
};

/**
 * @param apiKey
 * @param apiUsername
 * @return {boolean} whether the authenticationToken has a password digest matching the specified   
 */
function getAuthenticationHeadersForWSSE(apiKey, apiUsername) {
    passwordDigest = '';
    nonce = Math.floor(Math.random() * 999999);
    timestamp = moment().format("YYYY-MM-DDTHH:mm:ssZZ");
    passwordDigest = calculateAdminPasswordDigest(nonce, timestamp, apiKey);
    wsseToken = "UsernameToken Username=\"" + apiUsername + "\", ";
    wsseToken += "PasswordDigest=\"" + passwordDigest + "\", ";
    wsseToken += "Nonce=\"" + nonce + "\", ";
    wsseToken += "Created=\"" + timestamp + "\", ";

    return {
        "X-WSSE": wsseToken,
            "Authorization": "WSSE profile=\"UsernameToken\""
    };
};

function calculateAdminPasswordDigest(nonce, timestamp, apiKey) {
    return CryptoJS.enc.Base64.stringify(CryptoJS.SHA256(nonce + timestamp + apiKey));
};

/** end API authentication code */

/** Begin Test API call submission code */

/** submit the parameters/action to the API, using WSSE authentication token */
$('#test_api_call').submit(function () {
    authenticate();
    if (!authenticationHeaders) {
        alert("Authentication Failed.");
    } else {
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
    };

    return false;
});

/** end Test API call submission code */