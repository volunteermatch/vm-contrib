
import org.apache.log4j.Logger;

/**
 *
 */
public class HelloWorld {
  private static final Logger log = Logger.getLogger(HelloWorld.class);

  private static final String HELLO_WORLD_METHOD = "helloWorld";

  /** Usage : java org.vm.example.HelloWorld NameToDisplay ApiUsername ApiPassword
   *
   * @param args
   */
  public static void main(String[] args) {

    boolean showUsage = false;
    if (args.length != 3) {
      showUsage = true;
    } else {
      for (String arg : args) {
        if (arg == null || arg.equals("")) {
          showUsage = true;
          break;
        }
      }
    }

    if (showUsage) {
      throw new IllegalArgumentException("Usage : java org.vm.example.HelloWorld NameToDisplay ApiUsername ApiPassword");
    }

    // build up a query based on the program arguments
    String query = "{\"name\" : \"" + args[0] + "\"}";

    VolunteerMatchApiService service = new VolunteerMatchApiService();
    String result = service.callAPI(HELLO_WORLD_METHOD, query, VolunteerMatchApiService.HTTP_METHOD_GET, args[1], args[2]);
    System.out.println(result);
  }

}
