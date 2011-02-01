package org.vm.api

import groovyx.net.http.HTTPBuilder
import java.text.SimpleDateFormat
import java.text.DateFormat
import java.security.SecureRandom
import java.security.NoSuchAlgorithmException
import org.bouncycastle.util.encoders.Base64
import java.security.MessageDigest
import org.bouncycastle.crypto.Digest
import org.bouncycastle.crypto.digests.SHA1Digest
import org.bouncycastle.util.encoders.Hex

class VolunteerMatchService {
    boolean transactional = true

    def jobService

  	String host = "http://www.volunteermatch.org"
	String app_key = "secret_key"
    String app_name = "secret_name"

    def runHelloWorld(){
        try{
            String nonce = generateNonce()
            String created = generateCreated()
            String passwordDigest = generatePasswordDigest(nonce, created)
            def xwsse = "UsernameToken Username=\"${app_name}\", PasswordDigest=\"${passwordDigest}\", Nonce=\"${nonce}\", Created=\"${created}\""
            log.info xwsse
            def res = null
            def http = new HTTPBuilder( "http://www.volunteermatch.org/" )
            http.request( groovyx.net.http.Method.GET, groovyx.net.http.ContentType.JSON ) { req ->
                headers.'Accept-Charset' = 'UTF-8'
                headers.'Content-Type' = 'application/json'
                headers.'Authorization' = 'WSSE profile="UsernameToken"'
                headers.'X-WSSE' = xwsse
                req.getParams().setParameter("http.socket.timeout", new Integer(5000))
                uri.path = "api/call"
                uri.query =  [action:'helloWorld', query:'{"name": "john"}']
                response.success = { resp, json ->
                    log.info "success!"
                    res = json
                }
                response.failure = { resp ->
                    log.info "failed. ${resp.statusLine}"
                }
            }
            log.info res
        }catch(Exception e){
            log.info "${this.class.name}: ${e}"
        }
    }

    private String generatePasswordDigest(String nonce, String created) {
        String ret = null
        byte[] data = (nonce + created + app_key).getBytes();
        ret = new String(Base64.encode(sha256(data)));
        return ret
    }

    private String generateNonce() {
        String ret = null
        byte [] nonce = null;
        try {
            SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
            nonce = new byte[20];
            random.nextBytes(nonce);
        } catch (NoSuchAlgorithmException e) {
            log.info e
        }
        ret = new String(Base64.encode(nonce));
        return ret
    }

    private String generateCreated() {
        String ret = null
        DateFormat date_time_format =  new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
        ret = date_time_format.format(new Date(System.currentTimeMillis())) ;
        return ret
    }

    private byte[] sha256(byte[] payload) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.reset();
            byte[] result = digest.digest(payload);
            return result;
        } catch (NoSuchAlgorithmException e) { }
        return null;
    }


    private String hashPassword(String plainPassword) {
        if (plainPassword == null) {
            return null;
        }
        Digest digest = new SHA1Digest();
        byte[] resBuf = new byte[digest.getDigestSize()];
        byte[] plainBytes = plainPassword.getBytes();
        digest.update(plainBytes, 0, plainBytes.length);
        digest.doFinal(resBuf, 0);
        return new String(Hex.encode(resBuf));
    }
}
