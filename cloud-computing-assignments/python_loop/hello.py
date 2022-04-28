import webapp2

class MainPage(webapp2.RequestHandler):
    def get(self):
        for i in range(5):
            self.response.write("Adwait,\n 33120,\n IT dept.\n")


app = webapp2.WSGIApplication([('/', MainPage),
                               ],
                              debug=True)
