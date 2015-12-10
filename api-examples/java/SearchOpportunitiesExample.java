
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.ArrayList;

/**
 * Simple command line example of how one can call the VolunteerMatch public API to retrieve a list of opportunities.
 * This example makes 2 calls to the searchOpps method. The first will retrieve a full list of opportunities and the
 * second call shows how one would get a list of just the opportunities that have been updated since the first call was
 * made. This example is meant for someone who may want to maintain the list locally and only retrieve the updates on a
 * scheduled interval.
 *
 * Running the command with a "?" as a command line option will show the usage help.
 *
 * Created by jrackwitz on 12/3/15.
 */
public class SearchOpportunitiesExample {
  private static final String SEARCH_OPPORTUNITIES = "searchOpportunities";

  private static String url="http://www.stage.volunteermatch.org/api/call";

  // TODO - You will need to change the 2 lines bellow or make sure these are passed in on the command line
  private static String key = "Enter API Key here or on command line";
  private static String user = "Enter API user here or on command line";

  private static boolean debug = false;
  private static int displayCount = 3;
  private static String updatedSince = "2015-04-05T00:00:00Z";

  /** Usage : java SearchOpportunitiesExample ? - will show usage
   *
   * @param args
   */
  public static void main(String[] args) {

    for(int i=0; i < args.length; i++) {
      if (args[i].startsWith("url=")) {
        url = args[i].substring(args[i].indexOf("=") + 1);
      } else if (args[i].startsWith("user=")) {
        user = args[i].substring(args[i].indexOf("=") + 1);
      } else if (args[i].startsWith("key=")) {
        key = args[i].substring(args[i].indexOf("=") + 1);
      } else if (args[i].startsWith("debug=")) {
        debug = Boolean.parseBoolean(args[i].substring(args[i].indexOf("=") + 1));
      }  else if (args[i].startsWith("displayCount=")) {
        displayCount = Integer.parseInt(args[i].substring(args[i].indexOf("=") + 1));
      }  else if (args[i].startsWith("updatedSince=")) {
        updatedSince = args[i].substring(args[i].indexOf("=") + 1);
      } else {
        printUsage();
        System.exit(16);
      }
    }

    System.out.println("Using URL: " + url);
    System.out.println("Initial search.");
    searchOpps(null, displayCount);

    System.out.println("Search for just the updated opportunities.");
    searchOpps(updatedSince, displayCount);
  }


  static void searchOpps(String updatedSince, int maxDisplay) {
    VolunteerMatchApiService service = new VolunteerMatchApiService();
    service.setApiUrl(url); // this call is really only needed if you want use the stage server
    OppSearchResult statusResult = null;
    String result = null;
    int displayCount = 1;
    int pageNumber = 0;

    while( displayCount < maxDisplay) {
      pageNumber++;
      String searchOppsQuery = buildSearchOppsQuery(pageNumber, updatedSince);
      System.out.println("Search Query:");
      System.out.println(searchOppsQuery);
      result = service.callAPI(SEARCH_OPPORTUNITIES, searchOppsQuery, "POST", user, key);
      if (result == null) {
        System.out.println("Error - failed to make API call");
        System.exit(16);
      }
      if (debug) {
        System.out.println("Search Result:");
        System.out.println(result);
      }
      if ((statusResult = parseResult(result)) != null) {
        if(statusResult.getOpportunities().size() == 0) {
          break;
        }
        int resultSize = statusResult.getResultsSize();
        System.out.println("\nResult size: " + resultSize);
        System.out.println("Number of result returned: " + statusResult.getOpportunities().size());
        String displayMsg = maxDisplay < resultSize ? "Results (Limited output to first " + maxDisplay + " results):" : "Results: ";
        System.out.println(displayMsg);
        ArrayList<OppSearchResult.Opportunities> opps = statusResult.getOpportunities();
        for (OppSearchResult.Opportunities opp : opps) {
          System.out.println("     Id: " + opp.getId());
          System.out.println("  Title: " + opp.getTitle());
          System.out.println("Updated: " + opp.getUpdated());
          System.out.println(" Active: " + opp.getStatus());
          System.out.println();
          if (displayCount++ == maxDisplay) {
            break;
          }
        }
      } else {
        System.exit(16);
      }
    }
  }

  static String buildSearchOppsQuery(int pageNumber, String updatedSince) {
    OppSearchQuery oq = new OppSearchQuery();
    oq.setLocation("san francisco");
    oq.setRadius("city");
    ArrayList<OppSearchQuery.DateRange> dateRanges = new ArrayList<>();
    OppSearchQuery.DateRange dr = new OppSearchQuery.DateRange();
    dr.setSingleDayOpps(true);
    dr.setStartDate("2015-01-01");
    dr.setEndDate("2015-12-31");
    if(updatedSince != null && updatedSince.length() > 0) {
      oq.setUpdatedSince(updatedSince);
      oq.setIncludeInactive(true);
    }
    dateRanges.add(dr);
    dr = new OppSearchQuery.DateRange();
    dr.setOngoing(true);
    dateRanges.add(dr);
    oq.setDateRanges(dateRanges);
    oq.setSortOrder("asc");
    oq.setSortCriteria("update");
    oq.setPageNumber(pageNumber);
    ArrayList<String> displayFields = new ArrayList<>();
    displayFields.add("id");
    displayFields.add("title");
    displayFields.add("updated");
    displayFields.add("status");
    oq.setFieldsToDisplay(displayFields);
    Gson gson = new GsonBuilder().setPrettyPrinting().create();
    String json = gson.toJson(oq);
    return json;
  }

  static OppSearchResult parseResult(String result) {
    OppSearchResult reportResult = null;
    if(result != null) {
      String resultArray[] = result.split("\n");
      if (resultArray.length == 2) {
        try {
          Gson gson = new GsonBuilder().disableHtmlEscaping().create();
          reportResult = gson.fromJson(resultArray[1], OppSearchResult.class);
        } catch (Exception jbe) {
          System.out.println("Error decoding json result: " + jbe);
        }
      } else if (resultArray.length == 1) {
        System.out.println("Error calling " + SEARCH_OPPORTUNITIES + " API. Returned: " + resultArray[0]);
      }
    } else {
      System.out.println("Error calling " + SEARCH_OPPORTUNITIES + " API.");
    }
    return reportResult;
  }

  static private void printUsage() {
    System.out.println("Valid command line arguments:" );
    System.out.println("\nurl=http://www.stage.volunteermatch.org/api/call - This is the default and can be replaced with\n" +
                         "                                                   an alternate url of a test server." );
    System.out.println("\nuser=APIUSer - API account name");
    System.out.println("\nkey=APIKey - API account key");
    System.out.println("\ndebug=false - Set to true to enable debug messages");
    System.out.println("\ndisplayCount=3 - Number of opportunities to display (result set size and returned count is\n" +
                         "                 always displayed");
    System.out.println("\nupdatedSince=2015-04-05T00:00:00Z - Only search for opportunities updated since this date.\n" +
                         "                                    Format must be: ISO 8601 standard form of\n" +
                         "                                    \"yyyy-MM-ddTHH:mm:ssZ\"");
  }
}
