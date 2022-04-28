import webapp2

class MainPage(webapp2.RequestHandler) :
	def get(self):
		for i in range(0,5):
			self.response.write("Statment expected <br/>")
		
app = webapp2.WSGIApplication([('/',MainPage),],debug=True)