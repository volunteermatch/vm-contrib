<?php

	/**
	 * Defines a static class for managing communication through VM API v2
	 * (Drupal independant except for the one call to drupal_http_request() [line 54])
	 * @author Sharon Paisner
	 */
	class VolunteerMatchAPI {
		private static $path;
		private static $key;
		private static $username;
		private static $lastHeaders;
		private static $lastResponse;
		
		public function init($vmPath, $vmKey, $vmUsername) {
			self::$path = $vmPath;
			self::$key = $vmKey;
			self::$username = $vmUsername;
		}
		
		private function sendRequest($action, $query = NULL, $type = 'GET') {
			$headers_string = $_COOKIE['vmapi_session_headers'];
			if (!empty($headers_string))
				self::$lastHeaders = json_decode($headers_string);
			
			if (empty(self::$lastHeaders)) {
				// need to recreate our headers
				$timestamp = time();
				
				$nonce = hash('sha1', openssl_random_pseudo_bytes(20));
				$date = date('Y-m-d\TH:i:sO', $timestamp);
				$digest = base64_encode(hash('sha256', $nonce . $date . self::$key, TRUE));
				
				$header_array = array( 
									  'Content-Type' => 'application/json',
									  'Authorization' => 'WSSE profile="UsernameToken"',
									  'X-WSSE' => 
									  'UsernameToken Username="' . self::$username . 
									  '", PasswordDigest="' . $digest .
									  '", Nonce="' . $nonce .
									  '", Created="' . $date .
									  '"');
				
				self::$lastHeaders = $header_array;
				// by default, expire headers in 10 minutes
				setcookie('vmapi_session_headers', json_encode(self::$lastHeaders), $timestamp + 600, '/');
			}
			
			$json_query = json_encode($query);
			//print_r($json_query);
			$url = self::$path;
			$url .= '?action=' . $action;
			if ($query != NULL)
				$url .= '&query=' . urlencode($json_query);
			
			// upon reviewing the code for this class, drupal_http_request() is the only method
			// dependant upon drupal. in order to make the entire class drupal-independant
			// we would have to use a native PHP method for sending HTTP requests.
			self::$lastResponse = drupal_http_request($url, self::$lastHeaders, $type);
			if (self::$lastResponse->code > 200)
				print_r(self::$lastResponse);
		}
		
		private function displayResponse($type = 'none') {
			if (self::$lastResponse->code != '200')
				return 'last response from VolunteerMatch had code: ' . self::$lastResponse->code;
			
			$formattedData = json_decode(self::$lastResponse->data, TRUE);
			
			switch ($type) {
				case 'methods':
					return $formattedData['methods'];
				case 'member detail':
				case 'member summary':
				case 'reviews detail':
					return self::displayArrayAsHTML($formattedData);
				case 'opp detail':
				case 'opp summary':
				case 'org detail':
				case 'org summary':
				default:
					return $formattedData;
			}
		}
		
		private function displayArrayAsHTML($arrayname,$tab="&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp",$indent=0) {
			$curtab ="";
			$returnvalues = "";
			while(list($key, $value) = each($arrayname)) {
				for($i=0; $i<$indent; $i++) {
					$curtab .= $tab;
				}
				if (is_array($value)) {
					$returnvalues .= "$curtab $key : Array: <br />$curtab{<br />\n";
					$returnvalues .= self::displayArrayAsHTML($value,$tab,$indent+1)."$curtab}<br />\n";
				}
				else $returnvalues .= "$curtab $key => $value<br />\n";
				$curtab = NULL;
			}
			return $returnvalues;
		}
		
		public function createOrUpdateMembers($data) {
			$members = array('members' => $data);
			self::sendRequest('createOrUpdateMembers', $members, 'POST');
			return self::displayResponse('member detail');
		}
		
		public function createOrUpdateReferrals($oppId, $data, $waitList = NULL, $invitedBy = NULL) {
			$referrals = array(
				'oppId' => $oppId,
				//'waitList' => TRUE,
				'referrals' => $data,
			);
			if ($waitList != NULL)
				$referrals['waitList'] = $waitList;
			if ($invitedBy != NULL)
				$referrals['invitedBy'] = $invitedBy;
			
			self::sendRequest('createOrUpdateReferrals', $referrals, 'POST');
			return self::displayResponse();
		}
		
		// $data should be in the form:
		//	array(pk, pk, ... )
		public function getMembersDetails($data) {
			$members = array('members' => $data);
			self::sendRequest('getMembersDetails', $members);
			return self::displayResponse('member detail');
		}
		
		// $data should be in the form:
		//	array(pk, pk, ... )
		public function getMembersReferrals($data) {
			$members = array('members' => $data);
			self::sendRequest('getMembersReferrals', $members);
			return self::displayResponse();
		}
		
		// $data should be in the form:
		//	array(oppId, oppId, ...)
		public function getOpportunitiesReferrals($data) {
			$opportunities = array('opportunities' => $data);
			self::sendRequest('getOpportunitiesReferrals', $opportunities);
			return self::displayResponse();
		}
		
		// can display the result set in detail, or as summaries
		public function searchOpportunities($data, $display = 'opp summary') {
			$data['fieldsToDisplay'] = array();
			$data['fieldsToDisplay'][] = 'id';
			$data['fieldsToDisplay'][] = 'title';
			$data['fieldsToDisplay'][] = 'greatFor';
			$data['fieldsToDisplay'][] = 'categoryIds';
			$data['fieldsToDisplay'][] = 'parentOrg';
			$data['fieldsToDisplay'][] = 'created';
			$data['fieldsToDisplay'][] = 'location';
			
			if ($display != 'opp summary') {
				$data['fieldsToDisplay'][] = 'minimumAge';
				$data['fieldsToDisplay'][] = 'hasWaitList';
				$data['fieldsToDisplay'][] = 'volunteersNeeded';
				$data['fieldsToDisplay'][] = 'skillsNeeded';
				$data['fieldsToDisplay'][] = 'requirements';
				$data['fieldsToDisplay'][] = 'availability';
				$data['fieldsToDisplay'][] = 'referralFields';
				$data['fieldsToDisplay'][] = 'description';
			} else {
				$data['fieldsToDisplay'][] = 'plaintextDescription';
			}
			
			self::sendRequest('searchOpportunities', $data);
			return self::displayResponse($display);
		}
		
		// can display the result set in detail, or as summaries
		public function searchOrganizations($data, $display = 'org summary') {
			$data['fieldsToDisplay'] = array();
			$data['fieldsToDisplay'][] = 'id';
			$data['fieldsToDisplay'][] = 'name';
			$data['fieldsToDisplay'][] = 'description';
			$data['fieldsToDisplay'][] = 'categoryIds';
			$data['fieldsToDisplay'][] = 'type';
			$data['fieldsToDisplay'][] = 'created';
			$data['fieldsToDisplay'][] = 'avgRating';
			$data['fieldsToDisplay'][] = 'numReviews';
			$data['fieldsToDisplay'][] = 'location';
			 
			if ($display != 'org summary') {
				$data['fieldsToDisplay'][] = 'imageUrl';
				$data['fieldsToDisplay'][] = 'mission';
				$data['fieldsToDisplay'][] = 'url';
				$data['fieldsToDisplay'][] = 'contact';
			} else {
				$data['fieldsToDisplay'][] = 'plaintextDescription';
			}
			self::sendRequest('searchOrganizations', $data);
			return self::displayResponse($display);
		}
		
		public function getOrganizationReviewsSummary($orgId) {
			$data = array('ids' => array($orgId),
						  'fieldsToDisplay' => array('avgRating', 'numReviews'));
			self::sendRequest('searchOrganizations', $data);
			return self::displayResponse('reviews summary');
		}
		
		public function getOrganizationReviews($orgId) {
			$data = array('organization' => $orgId);
			self::sendRequest('getOrganizationReviews', $data);
			return self::displayResponse('reviews detail');
		}
		
		// this method should be called rarely and cached! results change infrequently
		public function getMetaData($version = NULL) {
			if ($version == NULL)
				self::sendRequest('getMetaData');
			else {
				$query = array('version' => $version);
				self::sendRequest('getMetaData', $query);
			}
			return self::displayResponse();
		}
		
		public function getKeyStatus() {
			self::sendRequest('getKeyStatus');
			return self::displayResponse();
		}
		
		// API testing method - not useful to real VM data
		public function testing() {
			self::sendRequest('helloWorld', array('name' => 'sharon'));
			return self::displayResponse();
		}
		
		// returns an array of the methods available to self::$key
		public function getMethods() {
			self::getKeyStatus();
			return self::displayResponse('methods');
		}
		
		// get the last response from VM
		public function getLastResponse($display = 'opp summary') {
			return self::displayResponse($display);
		}
	}

/**
 * example use:
 
 VolunteerMatchAPI::init('http://www.volunteermatch.org/api/call',
							'abcdefghijklmnopqrstuvwxyz',
							'username');
 $data = VolunteerMatchAPI::testing();
 
 */
	
	
//?>
