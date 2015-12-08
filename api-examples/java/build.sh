#!/bin/csh

# script to build and run the OppSearchExample
# you will need to obtain the 3 jar files used by this example and copy them to a lib directory
# then modify this script "LIB_DIR" to reference your copy of these jar files
# Also modify the script to use your API account and key.

setenv URL url=http://www.stage.volunteermatch.org/api/call
setenv KEY key=58375072ecc2c47abd8cee7627b1e908
setenv USER user=target
setenv DEBUG debug=true

setenv CUR_PATH `pwd`
setenv LIB_DIR ../../../oppSearchExample/lib
setenv CP ./:$LIB_DIR/axis.jar:$LIB_DIR/gson-2.1.jar:$LIB_DIR/log4j-1.2.16.jar

javac -cp $CP *.java
java -Dlog4j.configuration=file:////$CUR_PATH/log4j.xml -cp $CP OppSearchExample $URL $USER $KEY $DEBUG  
