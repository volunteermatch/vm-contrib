#!/usr/bin/env ruby

require 'rubygems'
require 'base64'
require 'digest/sha2'
require 'net/http'
require 'uri'
require 'json'
require 'ostruct'

if ARGV.length == 2
  account_name, api_key = ARGV
else
  puts "Usage: #{$0} account_name api_key"
  exit 1
end

class VolunteerMatchApi
  attr_accessor :account_name, :api_key

  def initialize (account_name, api_key)
    @account_name = account_name
    @api_key      = api_key
  end

  def helloWorld(name)
    api_call :helloWorld, {:name => name}.to_json
  end

  protected

  def api_call(action, json_query)
    nonce           = Digest::SHA2.hexdigest(rand.to_s)[0, 20]
    creation_time   = Time.now.utc.strftime("%Y-%m-%dT%H:%m:%S%z")
    password_digest = Base64.encode64(Digest::SHA2.digest(nonce + creation_time + @api_key)).chomp
    url             = URI.parse("http://www.stage.volunteermatch.org/api/call?action=#{action.to_s}&query=" + URI.encode(json_query))

    req             = Net::HTTP::Get.new(url.request_uri)
    req.add_field('Content-Type', 'application/json')
    req.add_field('Authorization', 'WSSE profile="UsernameToken"')
    req.add_field('X-WSSE', 'UsernameToken Username="' + @account_name + '", PasswordDigest="' + password_digest + '", ' +
        'Nonce="' + nonce + '", Created="' + creation_time + '"')

    res = Net::HTTP.new(url.host, url.port).start do |http|
      http.request(req)
    end

    raise "HTTP error code #{res.code}" unless res.code == "200"
    OpenStruct.new(JSON.parse res.body)
  end
end

api      = VolunteerMatchApi.new(account_name, api_key) # JSON returned is {"name":"World","result":"Hello World!"}
response = api.helloWorld("World")
puts response.name # "World"
puts response.result # "Hello World!"




