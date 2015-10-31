require 'sinatra'
require 'haml'
require "instagram"

# Fixes SSL Connection Error in Windows execution of Ruby
# Based on fix described at: https://gist.github.com/fnichol/867550
ENV['SSL_CERT_FILE'] = File.expand_path(File.dirname(__FILE__)) + "/config/cacert.pem"

set :public_folder, File.dirname(__FILE__) + '/static'

enable :sessions

CALLBACK_URL = "http://insta-ymap.herokuapp.com/oauth/callback"

def get_id_and_secret_from_file
	# First line in file = client id
	# Second ling in file = client secret
	File.readlines('inst_api_keys.txt')
end


Instagram.configure do |config|
	keys = get_id_and_secret_from_file
	puts 'Keys:'
	config.client_id = keys[0].strip
	config.client_secret = keys[1].strip
end

get '/' do
	haml :index, :format => :html5
end

get "/oauth/connect" do
	redirect Instagram.authorize_url(redirect_uri: CALLBACK_URL)
end

get "/oauth/callback" do
	response = Instagram.get_access_token(params[:code], redirect_uri: CALLBACK_URL)
	session[:access_token] = response.access_token
	redirect "/get_photos"
end

get '/get_photos' do
	haml :index, :format => :html5
end

post "/get_photos" do
	client = Instagram.client(access_token: session[:access_token])
	lat = params[:lat]
	lon = params[:lon]
	dist = params[:dist]
	media_items = client.media_search(lat, lon, distance: dist)
	html = haml :index, locals: {lat: lat, lon: lon, media_items: media_items}
	html
end

post "/get_photos_ajax" do
	client = Instagram.client(access_token: session[:access_token])
	lat = params[:lat]
	lon = params[:lon]
	dist = params[:dist]
	media_items = client.media_search(lat, lon, distance: dist)
	resp = []
	for media_item in media_items
		resp << [media_item.images.standard_resolution.url, media_item.link, media_item.user.username]
	end
	{media: resp}.to_json
end