using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace ConsoleApplication
{
    public class VolunteerMatchAPI
    {

        static bool isProduction = false;
        static String volunteerMatchAPIUrl = isProduction ? "https://api.volunteermatch.org/api/call" : "http://api.stage.volunteermatch.org/api/call";
        static String apiKey = isProduction ? "enter production key here" : "enter stage key here";
        static String apiUsername = "your username";

        static String BuildAuthenticationHeader()
        {
            System.Security.Cryptography.RNGCryptoServiceProvider provider = new System.Security.Cryptography.RNGCryptoServiceProvider();

            byte[] bytes = new byte[20];
            provider.GetBytes(bytes);
            String nonce = System.Convert.ToBase64String(bytes);
            String created = String.Format("{0:yyyy-MM-dd'T'HH:mm:sszz00}", DateTime.Now);
            byte[] intermediateBytes = System.Text.UTF8Encoding.UTF8.GetBytes(nonce + created + apiKey);
            byte[] passwordDigestHash = System.Security.Cryptography.SHA256.Create().ComputeHash(intermediateBytes);

            String passwordDigest = System.Convert.ToBase64String(passwordDigestHash, Base64FormattingOptions.None);

            return "UsernameToken Username=\"" + apiUsername + "\",PasswordDigest=\"" + passwordDigest + "\",Nonce=\"" + nonce + "\",Created=\"" + created + "\"";
        }

        static String CallVolunteerMatchAPI(String action, String requestParameters, String method)
        {
            String result = "";

            System.Net.WebRequest webRequest = System.Net.WebRequest.Create(new Uri(volunteerMatchAPIUrl + "?action=" + action + "&" + requestParameters));
            webRequest.Method = method;
            webRequest.Headers.Add("Authorization", "WSSE profile=\"UsernameToken\"");
            webRequest.Headers.Add("X-WSSE", BuildAuthenticationHeader());
            try
            {
                System.Net.WebResponse webResponse = webRequest.GetResponse();
                System.IO.StreamReader reader = new System.IO.StreamReader(webResponse.GetResponseStream());
                result = reader.ReadToEnd();
            }
            catch (System.Net.WebException we)
            {
                result = "Http Status: " + we.GetBaseException().Message;
            }

            return result;
        }

        static void Main(string[] args)
        {
            String result = CallVolunteerMatchAPI("helloWorld", "query={\"name\":\"Fred\"}", "GET");
            Console.WriteLine(result);
            Console.WriteLine("Press enter key to exit");
            Console.ReadLine();
        }


    }
}
