#!/usr/bin/env ruby

require 'base64'
require 'digest/sha2'

if ARGV.length == 2
  account_name, api_key = ARGV
else
  puts "Usage: #{$0} account_name api_key"
  exit 1
end

class VolunteerMatchApi
  attr_reader :nonce, :creation_time, :digest

  def initialize (account_name, api_key)
    @account_name = account_name
    @api_key      = api_key
    @nonce           = Digest::SHA2.hexdigest(rand.to_s)[0, 20]
    @creation_time   = Time.now.utc.strftime("%Y-%m-%dT%H:%m:%S%z")
    @digest = Base64.encode64(Digest::SHA2.digest(nonce + creation_time + @api_key)).chomp
  end
end

api = VolunteerMatchApi.new(account_name, api_key)
puts "Account Name:   #{account_name}"
puts "Nonce:          #{api.nonce}"
puts "Digest:         #{api.digest}"
puts "Creation Time:  #{api.creation_time}"

