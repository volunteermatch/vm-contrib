package org.vm.sample;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import org.codehaus.jackson.map.ObjectMapper;

/**
 * Created by jguo on 4/4/16.
 */
public class APIController {

  private static  String OPERATION;

  private static String url = "http://www.stage.volunteermatch.org/api/call";

  // TODO - You will need to change the 2 lines bellow or make sure these are passed in on the command line
  private static String key = "Enter API Key here or on command line";
  private static String user = "Enter API user here or on command line";
  private static String dataFile;

  private static boolean debug = false;
  private static int displayCount = 3;
  private static String updatedSince = "2015-04-05T00:00:00Z";
  private static String apiMethod;

  public static void main(String[] args) {
    if (args.length < 4) {
      System.out.println("user,key, operation, and API method (PUT/POST) and data file informamtion are required");
      System.exit(1);
    }
    System.out.println("Parsing the command line prarameters ...");
    for (int i = 0; i < args.length; i++) {
      if (args[i].startsWith("url=")) {
        url = args[i].substring(args[i].indexOf("=") + 1);
      } else if (args[i].startsWith("user=")) {
        user = args[i].substring(args[i].indexOf("=") + 1);
      } else if (args[i].startsWith("key=")) {
        key = args[i].substring(args[i].indexOf("=") + 1);
      } else if (args[i].startsWith("debug=")) {
        debug = Boolean.parseBoolean(args[i].substring(args[i].indexOf("=") + 1));
      } else if (args[i].startsWith("dataFile=")) {
        dataFile = args[i].substring(args[i].indexOf("=") + 1);
      } else if (args[i].startsWith("operation=")) {
        OPERATION=args[i].substring(args[i].indexOf("=") + 1);
      } else if (args[i].startsWith("apiMethod=")) {
        apiMethod=args[i].substring(args[i].indexOf("=") + 1).toUpperCase();
      } else {
        //printUsage();
        System.exit(16);
      }
    }
    try {
      operate();
    } catch (IOException e) {
      e.printStackTrace();
    }

  }

  private static void operate() throws IOException {
    VolunteerMatchApiService service = new VolunteerMatchApiService();
    service.setApiUrl(url);
    String payLoad = getPayload();
    payLoad = payLoad.replaceAll("\n","");
    System.out.println("Paload is " + payLoad);
    String result = service.callAPI(OPERATION, payLoad, apiMethod, user, key);
    System.out.println(result);
    String jsonStr = getJsonStr(result);
    ObjectMapper mapper = new ObjectMapper();
    Object json = mapper.readValue(jsonStr, Object.class);
    String indented = mapper.writerWithDefaultPrettyPrinter()
      .writeValueAsString(json);
    System.out.println(indented);
  }

  private static String getJsonStr(String result) {
    String resultArray[] = result.split("\n");
    if(resultArray.length==2){
      return resultArray[1];
    }
    return null;
  }

  private static String getPayload() throws IOException {
    File file = new File(dataFile);
    if (!file.exists()) {
      throw new IOException("Data file doesn't exist");
    }
    byte[] encoded = Files.readAllBytes(Paths.get(dataFile));
    return new String(encoded, "UTF-8");
  }
}
